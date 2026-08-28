// Local decision engine. Pure functions, no network calls.
// This is where the "smart system" lives: parsing intent, scoring places,
// composing plans, comparing transport and recalculating when conditions change.

import { PLACES, WEATHER, type Availability, type Category, type Place } from "./data";

export type Walking = "low" | "medium" | "high";
export type GroupType = "solo" | "couple" | "family" | "seniors" | "friends";

export type Prefs = {
  name: string;
  language: string;
  mode: "tourist" | "resident";
  interests: string[];
  budgetStyle: "budget" | "balanced" | "premium";
  walking: Walking;
  veg: boolean;
  groupType: GroupType;
  groupSize: number;
  accessibility: { wheelchair: boolean; stepFree: boolean; restrooms: boolean };
};

export const defaultPrefs: Prefs = {
  name: "Traveller",
  language: "en",
  mode: "tourist",
  interests: ["History", "Food", "Culture"],
  budgetStyle: "balanced",
  walking: "medium",
  veg: false,
  groupType: "family",
  groupSize: 3,
  accessibility: { wheelchair: false, stepFree: false, restrooms: true },
};

/* ------------------------------------------------------------------ time */

export const fmtTime = (min: number) => {
  const h = Math.floor(min / 60) % 24;
  const m = Math.round(min % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export const nowMinutes = () => {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
};

export const isOpenAt = (p: Place, minutes: number) => {
  const h = (minutes / 60) % 24;
  if (p.closes === 24 && p.opens === 0) return true;
  return h >= p.opens && h < p.closes;
};

export const closesInMin = (p: Place, minutes: number) => p.closes * 60 - minutes;

export const money = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

/* -------------------------------------------------------------- transport */

export type Mode = "walk" | "bus" | "auto" | "cab" | "bike" | "metro";

export type TransportOption = {
  mode: Mode;
  label: string;
  cost: number;
  minutes: number;
  walkingLoad: "high" | "medium" | "low";
  note: string;
};

export function transportOptions(km: number, groupSize = 1): TransportOption[] {
  const k = Math.max(0.2, km);
  const opts: TransportOption[] = [
    {
      mode: "walk",
      label: "Walking",
      cost: 0,
      minutes: Math.round(k * 13),
      walkingLoad: "high",
      note: "Free, but full distance on foot",
    },
    {
      mode: "bus",
      label: "Bus",
      cost: Math.max(10, Math.round(k * 4)),
      minutes: Math.round(k * 5 + 12),
      walkingLoad: "medium",
      note: "Cheapest motorised option, includes stop walk",
    },
    {
      mode: "metro",
      label: "Metro",
      cost: Math.max(15, Math.round(k * 5)),
      minutes: Math.round(k * 3.2 + 10),
      walkingLoad: "medium",
      note: "Fast on corridors, station walk at both ends",
    },
    {
      mode: "auto",
      label: "Auto",
      cost: Math.max(40, Math.round(30 + k * 18)),
      minutes: Math.round(k * 3.6 + 4),
      walkingLoad: "low",
      note: "Door to door, negotiate before boarding",
    },
    {
      mode: "cab",
      label: "Cab",
      cost: Math.max(70, Math.round(55 + k * 24)),
      minutes: Math.round(k * 3.1 + 3),
      walkingLoad: "low",
      note: `Fits ${Math.max(4, groupSize)} people for one fare`,
    },
    {
      mode: "bike",
      label: "Bike taxi",
      cost: Math.max(30, Math.round(22 + k * 12)),
      minutes: Math.round(k * 3 + 3),
      walkingLoad: "low",
      note: "Single rider only",
    },
  ];
  if (k > 2.5) opts.splice(0, 1); // walking stops being realistic
  return opts;
}

export function recommendTransport(km: number, prefs: Prefs) {
  const opts = transportOptions(km, prefs.groupSize);
  const cheapest = [...opts].sort((a, b) => a.cost - b.cost)[0]!;
  const fastest = [...opts].sort((a, b) => a.minutes - b.minutes)[0]!;
  const walkOk = prefs.walking === "high" && !prefs.accessibility.wheelchair;
  const lowLoad = opts.filter((o) => o.walkingLoad === "low");
  let pick = cheapest;
  if (prefs.accessibility.wheelchair || prefs.walking === "low" || prefs.groupType === "seniors") {
    pick = [...lowLoad].sort((a, b) => a.cost - b.cost)[0] ?? fastest;
    pick = pick ?? fastest;
  } else if (prefs.budgetStyle === "premium") {
    pick = fastest;
  } else if (!walkOk && cheapest.mode === "walk") {
    pick = opts.filter((o) => o.mode !== "walk").sort((a, b) => a.cost - b.cost)[0] ?? fastest;
  }
  const saving = fastest.cost - pick.cost;
  const extra = pick.minutes - fastest.minutes;
  const reason =
    pick.mode === fastest.mode
      ? `${pick.label} is both the quickest and fits your preferences.`
      : saving > 0
        ? `${pick.label} saves ${money(saving)} for only ${extra} extra minutes.`
        : `${pick.label} matches your walking and group preferences.`;
  return { options: opts, pick, reason };
}

/* ------------------------------------------------------------------ score */

export type Ctx = { minutes: number; budget: number; hours: number };

export function conditionAt(hour: number) {
  const slot = [...WEATHER.hourly].reverse().find((s) => s.hour <= hour) ?? WEATHER.now;
  return slot;
}

export function weatherAdvice(hour: number) {
  const c = conditionAt(hour).condition;
  if (c === "rain") return { icon: "Rain", label: "Indoor recommended", tone: "warn" as const };
  if (c === "hot") return { icon: "Hot", label: "Heat caution", tone: "warn" as const };
  if (c === "cloud") return { icon: "Cloudy", label: "Comfortable outdoors", tone: "ok" as const };
  return { icon: "Clear", label: "Outdoor friendly", tone: "ok" as const };
}

const interestTags: Record<string, string[]> = {
  History: ["history", "landmark", "restored", "palace"],
  Food: ["biryani", "breakfast", "chai", "rooftop", "late-night"],
  Shopping: ["market", "souvenirs", "handicrafts", "bangles", "street"],
  Culture: ["museum", "temple", "culture", "art", "history"],
  Nature: ["walk", "views", "sunset", "flat-walk"],
  Photography: ["photography", "views", "sunset"],
  Nightlife: ["rooftop", "late-night", "date"],
  Family: ["family", "kids", "seniors", "rest"],
};

export type Scored = { place: Place; score: number; reasons: string[]; warnings: string[] };

export function scorePlace(place: Place, prefs: Prefs, ctx: Ctx): Scored {
  let score = 50;
  const reasons: string[] = [];
  const warnings: string[] = [];

  // distance
  if (place.distanceKm <= 2) {
    score += 12;
    reasons.push(`Only ${place.distanceKm} km away`);
  } else if (place.distanceKm <= 5) score += 6;
  else if (place.distanceKm > 9) {
    score -= 8;
    warnings.push("Long transfer from your location");
  }

  // cost fit
  const spend = place.entryFee + place.avgSpend;
  const perHead = ctx.budget / Math.max(1, prefs.groupSize);
  if (spend <= perHead * 0.35) {
    score += 12;
    reasons.push(spend === 0 ? "Free entry" : `Fits your budget at about ${money(spend)}`);
  } else if (spend > perHead) {
    score -= 14;
    warnings.push("Above your stated budget");
  }

  // rating
  score += (place.rating - 4) * 14;
  if (place.rating >= 4.5) reasons.push(`Rated ${place.rating} by ${place.reviews.toLocaleString("en-IN")} visitors`);

  // open now
  if (isOpenAt(place, ctx.minutes)) {
    reasons.push("Open right now");
    const left = closesInMin(place, ctx.minutes);
    if (left < place.durationMin + 20 && left > 0) {
      score -= 10;
      warnings.push(`Closes in ${Math.max(0, Math.round(left))} min`);
    }
  } else {
    score -= 30;
    warnings.push(`Closed now — opens ${String(place.opens).padStart(2, "0")}:00`);
  }

  // time fit
  if (place.durationMin <= ctx.hours * 60 * 0.55) score += 8;
  else {
    score -= 10;
    warnings.push("Needs more time than you have");
  }

  // interests
  const tags = prefs.interests.flatMap((i) => interestTags[i] ?? []);
  const hits = place.tags.filter((t) => tags.includes(t));
  if (hits.length) {
    score += Math.min(14, hits.length * 6);
    reasons.push(`Matches your interest in ${prefs.interests.find((i) => (interestTags[i] ?? []).some((t) => place.tags.includes(t)))}`);
  }

  // weather
  const cond = conditionAt(Math.floor(ctx.minutes / 60)).condition;
  if ((cond === "rain" || cond === "hot") && place.indoor) {
    score += 12;
    reasons.push(cond === "rain" ? "Indoor, good for the expected showers" : "Indoor shelter from the heat");
  }
  if ((cond === "rain" || cond === "hot") && !place.indoor) {
    score -= 12;
    warnings.push(cond === "rain" ? "Mostly outdoors, rain expected" : "Mostly outdoors in peak heat");
  }

  // walking / group / accessibility
  if (prefs.walking === "low" && place.distanceKm > 4 && !place.accessibility.stepFree) score -= 6;
  if (prefs.accessibility.wheelchair) {
    if (place.accessibility.wheelchair) {
      score += 10;
      reasons.push(place.accessibility.verified ? "Wheelchair access verified" : "Wheelchair access reported");
    } else {
      score -= 25;
      warnings.push("Not wheelchair accessible");
    }
  }
  if (prefs.accessibility.stepFree && !place.accessibility.stepFree) {
    score -= 12;
    warnings.push("Has steps on the main route");
  }
  if ((prefs.groupType === "family" || prefs.groupType === "seniors") && place.accessibility.restrooms) {
    score += 5;
    reasons.push("Restrooms and seating on site");
  }
  if (prefs.groupType === "seniors" && !place.indoor && place.durationMin > 100) {
    score -= 10;
    warnings.push("Long outdoor stretch for seniors");
  }
  if (prefs.veg && place.menu && !place.menu.some((m) => m.veg)) {
    score -= 15;
    warnings.push("No vegetarian items listed");
  }

  // freshness
  if (place.verifiedHoursAgo > 24) warnings.push("Details not verified in the last day");

  return {
    place,
    score: Math.max(4, Math.min(99, Math.round(score))),
    reasons: reasons.slice(0, 5),
    warnings: warnings.slice(0, 3),
  };
}

export function rankPlaces(prefs: Prefs, ctx: Ctx, filter?: (p: Place) => boolean) {
  return PLACES.filter((p) => p.category !== "parking" && p.category !== "pharmacy")
    .filter((p) => (filter ? filter(p) : true))
    .map((p) => scorePlace(p, prefs, ctx))
    .sort((a, b) => b.score - a.score);
}

/* ------------------------------------------------------------------- plan */

export type PlanItem =
  | { kind: "travel"; startMin: number; endMin: number; mode: Mode; label: string; cost: number; km: number }
  | {
      kind: "visit";
      startMin: number;
      endMin: number;
      placeId: string;
      label: string;
      cost: number;
      why: string[];
      warnings: string[];
    };

export type CostBreakdown = {
  transport: number;
  food: number;
  entry: number;
  parking: number;
  activities: number;
  misc: number;
};

export type Plan = {
  id: string;
  label: string;
  tag: string;
  items: PlanItem[];
  cost: CostBreakdown;
  totalCost: number;
  totalMinutes: number;
  km: number;
  score: number;
};

export type PlanInput = {
  hours: number;
  budget: number;
  startMin: number;
  prefs: Prefs;
  exclude?: string[] | undefined;
  variant?: "best" | "cheap" | "fast" | "experience" | undefined;
};

const sumCost = (c: CostBreakdown) => c.transport + c.food + c.entry + c.parking + c.activities + c.misc;

function pickTransport(km: number, prefs: Prefs, variant: PlanInput["variant"]) {
  const opts = transportOptions(km, prefs.groupSize);
  if (variant === "cheap") return [...opts].sort((a, b) => a.cost - b.cost)[0]!;
  if (variant === "fast") return [...opts].sort((a, b) => a.minutes - b.minutes)[0]!;
  if (variant === "experience") return recommendTransport(km, { ...prefs, budgetStyle: "premium" }).pick;
  return recommendTransport(km, prefs).pick;
}

export function buildPlan(input: PlanInput): Plan {
  const { hours, budget, startMin, prefs } = input;
  const variant = input.variant ?? "best";
  const ctx: Ctx = { minutes: startMin, budget, hours };
  const exclude = new Set(input.exclude ?? []);

  let pool = rankPlaces(prefs, ctx, (p) => !exclude.has(p.id));
  if (variant === "cheap") pool = [...pool].sort((a, b) => a.place.entryFee + a.place.avgSpend - (b.place.entryFee + b.place.avgSpend) || b.score - a.score);
  if (variant === "fast") pool = [...pool].sort((a, b) => a.place.distanceKm - b.place.distanceKm || b.score - a.score);
  if (variant === "experience") pool = [...pool].sort((a, b) => b.place.rating - a.place.rating || b.score - a.score);

  const items: PlanItem[] = [];
  const cost: CostBreakdown = { transport: 0, food: 0, entry: 0, parking: 0, activities: 0, misc: 0 };
  const endLimit = startMin + hours * 60;
  let t = startMin;
  let from = 0.8; // km from current location to first hop baseline
  let km = 0;
  let scoreSum = 0;
  let count = 0;
  let hadFood = false;

  for (const cand of pool) {
    if (t >= endLimit - 25) break;
    const p = cand.place;
    if (p.category === "food" || p.category === "cafe") {
      if (hadFood && count > 0 && p.avgSpend > 200) continue;
    }
    const legKm = Math.max(0.5, Math.abs(p.distanceKm - from) || p.distanceKm * 0.4);
    const opt = pickTransport(legKm, prefs, variant);
    const arrive = t + opt.minutes;
    if (!isOpenAt(p, arrive)) continue;
    const stay = Math.min(p.durationMin, Math.max(25, endLimit - arrive - opt.minutes - 10));
    if (stay < 20) continue;

    const spend = p.entryFee * prefs.groupSize + (p.category === "food" || p.category === "cafe" ? p.avgSpend * prefs.groupSize : p.avgSpend);
    const projected = sumCost(cost) + opt.cost + spend;
    if (projected > budget && count > 0) continue;

    items.push({
      kind: "travel",
      startMin: t,
      endMin: arrive,
      mode: opt.mode,
      label: `${opt.label} to ${p.name}`,
      cost: opt.cost,
      km: Number(legKm.toFixed(1)),
    });
    items.push({
      kind: "visit",
      startMin: arrive,
      endMin: arrive + stay,
      placeId: p.id,
      label: p.name,
      cost: spend,
      why: cand.reasons,
      warnings: cand.warnings,
    });

    cost.transport += opt.cost;
    if (p.category === "food" || p.category === "cafe") {
      cost.food += spend;
      hadFood = true;
    } else if (p.category === "shopping") cost.activities += spend;
    else cost.entry += spend;

    km += legKm;
    t = arrive + stay;
    from = p.distanceKm;
    scoreSum += cand.score;
    count += 1;
    if (count >= (hours <= 3 ? 3 : hours <= 6 ? 4 : 6)) break;
  }

  // return leg
  if (count > 0) {
    const back = pickTransport(Math.max(1, from), prefs, variant);
    items.push({
      kind: "travel",
      startMin: t,
      endMin: t + back.minutes,
      mode: back.mode,
      label: "Return to your start point",
      cost: back.cost,
      km: Number(from.toFixed(1)),
    });
    cost.transport += back.cost;
    km += from;
    t += back.minutes;
  }

  cost.parking = prefs.groupSize > 3 ? 60 : 0;
  cost.misc = Math.round(sumCost(cost) * 0.06);

  const labels: Record<string, { label: string; tag: string } | undefined> = {
    best: { label: "Best overall", tag: "Balanced cost, time and match" },
    cheap: { label: "Cheapest", tag: "Lowest total spend" },
    fast: { label: "Fastest", tag: "Least travel time" },
    experience: { label: "Best experience", tag: "Highest rated stops" },
  };

  return {
    id: variant,
    label: labels[variant]?.label ?? "Plan",
    tag: labels[variant]?.tag ?? "",
    items,
    cost,
    totalCost: sumCost(cost),
    totalMinutes: t - startMin,
    km: Number(km.toFixed(1)),
    score: count ? Math.round(scoreSum / count) : 0,
  };
}

export function buildPlanSet(input: Omit<PlanInput, "variant">): Plan[] {
  return (["best", "cheap", "fast", "experience"] as const).map((v) => buildPlan({ ...input, variant: v }));
}

/** Swap out one stop (closure, delay, weather) and keep the return time. */
export function replan(plan: Plan, closedPlaceId: string, input: Omit<PlanInput, "variant" | "exclude">) {
  const excluded = plan.items
    .filter((i): i is Extract<PlanItem, { kind: "visit" }> => i.kind === "visit")
    .map((i) => i.placeId)
    .filter((id) => id !== closedPlaceId);
  const next = buildPlan({
    ...input,
    variant: (plan.id as "best" | "cheap" | "fast" | "experience") ?? "best",
    exclude: [closedPlaceId],
  });
  const added = next.items
    .filter((i): i is Extract<PlanItem, { kind: "visit" }> => i.kind === "visit")
    .find((i) => !excluded.includes(i.placeId));
  return { plan: next, replacement: added?.label ?? null };
}

/* --------------------------------------------------------- query parsing */

export type ParsedQuery = {
  budget?: number | undefined;
  hours?: number | undefined;
  categories: Category[];
  dish?: string | undefined;
  openNow: boolean;
  accessible: boolean;
  veg?: boolean | undefined;
  group?: GroupType | undefined;
  indoorOnly: boolean;
  hiddenGems: boolean;
  raw: string;
};

const DISHES = ["biryani", "haleem", "chai", "coffee", "pizza", "idli", "dosa", "bun maska", "chicken", "mutton"];

export function parseQuery(raw: string): ParsedQuery {
  const q = raw.toLowerCase();
  const money = q.match(/(?:₹|rs\.?|inr)\s?(\d{2,6})|under\s(\d{2,6})|(\d{2,6})\s?(?:rupees|rs)/);
  const hours = q.match(/(\d+(?:\.\d+)?)\s?(?:hour|hr|hrs|hours|ghante)/);
  const mins = q.match(/(\d{2,3})\s?(?:min|minutes)/);
  const categories: Category[] = [];
  if (/(food|eat|restaurant|lunch|dinner|breakfast|biryani|snack|hungry)/.test(q)) categories.push("food");
  if (/(cafe|chai|coffee|tea)/.test(q)) categories.push("cafe");
  if (/(museum|temple|culture|heritage|history|monument)/.test(q)) categories.push("culture", "attraction");
  if (/(shop|market|souvenir|buy|bazaar)/.test(q)) categories.push("shopping");
  if (/(parking|park my)/.test(q)) categories.push("parking");
  if (/(pharmacy|medicine|chemist|medical)/.test(q)) categories.push("pharmacy");
  if (/(see|visit|attraction|viewpoint|sunset|things to do)/.test(q)) categories.push("attraction");

  let group: GroupType | undefined;
  if (/(parents|family|kids|children)/.test(q)) group = "family";
  else if (/(senior|elderly|grandparent)/.test(q)) group = "seniors";
  else if (/(friends|group)/.test(q)) group = "friends";
  else if (/(alone|solo|myself)/.test(q)) group = "solo";
  else if (/(date|partner|wife|husband)/.test(q)) group = "couple";

  return {
    budget: money ? Number(money[1] ?? money[2] ?? money[3]) : undefined,
    hours: hours ? Number(hours[1]) : mins ? Number(mins[1]) / 60 : undefined,
    categories: [...new Set(categories)],
    dish: DISHES.find((d) => q.includes(d)),
    openNow: /(open now|right now|now|tonight|currently)/.test(q),
    accessible: /(wheelchair|accessib|step-free|step free)/.test(q),
    veg: /(veg\b|vegetarian)/.test(q) ? true : /(non-veg|nonveg|chicken|mutton)/.test(q) ? false : undefined,
    group,
    indoorOnly: /(rain|indoor|raining|shelter)/.test(q),
    hiddenGems: /(hidden|offbeat|local secret|lesser known)/.test(q),
    raw,
  };
}

export type DishHit = { place: Place; item: { name: string; price: number; veg: boolean }; travelMin: number };

export function searchDishes(q: ParsedQuery): DishHit[] {
  const hits: DishHit[] = [];
  for (const p of PLACES) {
    if (!p.menu) continue;
    for (const item of p.menu) {
      if (q.dish && !item.name.toLowerCase().includes(q.dish) && !q.dish.includes(item.name.toLowerCase().split(" ")[0] ?? "")) continue;
      if (q.budget && item.price > q.budget) continue;
      if (q.veg === true && !item.veg) continue;
      if (q.veg === false && item.veg) continue;
      hits.push({ place: p, item, travelMin: Math.round(p.distanceKm * 3.6 + 4) });
    }
  }
  return hits.sort((a, b) => a.item.price - b.item.price || a.place.distanceKm - b.place.distanceKm);
}

export function searchPlaces(q: ParsedQuery, prefs: Prefs, ctx: Ctx) {
  return rankPlaces(
    {
      ...prefs,
      groupType: q.group ?? prefs.groupType,
      accessibility: q.accessible ? { wheelchair: true, stepFree: true, restrooms: true } : prefs.accessibility,
      veg: q.veg ?? prefs.veg,
    },
    { ...ctx, budget: q.budget ?? ctx.budget, hours: q.hours ?? ctx.hours },
    (p) => {
      if (q.categories.length && !q.categories.includes(p.category)) return false;
      if (q.openNow && !isOpenAt(p, ctx.minutes)) return false;
      if (q.indoorOnly && !p.indoor) return false;
      if (q.hiddenGems && !p.hiddenGem) return false;
      if (q.budget && p.entryFee + p.avgSpend > q.budget) return false;
      return true;
    },
  );
}

/* ---------------------------------------------------------- notifications */

export type SmartNote = { id: string; tone: "info" | "warn"; title: string; body: string };

export function contextNotes(plan: Plan | null, prefs: Prefs, minutes: number): SmartNote[] {
  const notes: SmartNote[] = [];
  const rainSlot = WEATHER.hourly.find((s) => s.condition === "rain" && s.hour * 60 > minutes);
  if (rainSlot)
    notes.push({
      id: "rain",
      tone: "warn",
      title: `Showers expected around ${String(rainSlot.hour).padStart(2, "0")}:00`,
      body: "Move outdoor stops earlier, or swap in an indoor museum for that window.",
    });
  const next = plan?.items.find((i) => i.kind === "visit" && i.startMin >= minutes) as
    | Extract<PlanItem, { kind: "visit" }>
    | undefined;
  if (next) {
    notes.push({
      id: "next",
      tone: "info",
      title: `Next up: ${next.label} at ${fmtTime(next.startMin)}`,
      body: `About ${Math.max(0, Math.round(next.startMin - minutes))} minutes from now.`,
    });
    const p = PLACES.find((x) => x.id === next.placeId);
    if (p && closesInMin(p, minutes) < 90 && closesInMin(p, minutes) > 0)
      notes.push({
        id: "closing",
        tone: "warn",
        title: `${p.name} closes in ${Math.round(closesInMin(p, minutes))} min`,
        body: "Leaving now keeps the rest of the day on schedule.",
      });
  }
  if (prefs.groupType === "seniors" || prefs.walking === "low")
    notes.push({
      id: "rest",
      tone: "info",
      title: "Rest breaks are built in",
      body: "Routes avoid walks longer than 10 minutes at a stretch and prefer stops with seating.",
    });
  return notes;
}

/* --------------------------------------------------------------- packing */

export function packingList(days: number, prefs: Prefs) {
  const base = [
    "Comfortable walking shoes",
    "Photo ID and travel documents",
    "Phone charger and power bank",
    "Reusable water bottle",
    "Small cash for autos and street stalls",
  ];
  if (WEATHER.hourly.some((h) => h.condition === "rain")) base.push("Compact umbrella or rain shell");
  if (WEATHER.hourly.some((h) => h.condition === "hot")) base.push("Sun hat and sunscreen");
  if (prefs.groupType === "family") base.push("Snacks for children", "Wet wipes");
  if (prefs.groupType === "seniors") base.push("Regular medication", "Folding cane or seat stick");
  if (prefs.accessibility.wheelchair) base.push("Wheelchair repair kit", "Portable ramp if you have one");
  if (days > 2) base.push(`${days} days of clothing`, "Laundry bag");
  if (prefs.interests.includes("Photography")) base.push("Spare camera battery");
  return base;
}

export const availabilityLabel: Record<Availability, string> = {
  available: "Available",
  limited: "Limited",
  unavailable: "Unavailable",
  unknown: "Unknown",
};
