// Client-side persistent store (localStorage). Single source of truth for
// user data in the demo build; swap the read/write functions for API calls later.

import { useSyncExternalStore } from "react";
import { BUSINESSES, REPORTS, type Availability, type Business, type MenuItem, type Report } from "./data";
import { buildPlan, defaultPrefs, packingList, type Plan, type PlanItem, type Prefs } from "./engine";

export type ItineraryItem = {
  id: string;
  startMin: number;
  endMin: number;
  kind: "visit" | "travel" | "note";
  title: string;
  placeId?: string | undefined;
  cost: number;
  note?: string | undefined;
};

export type Member = {
  id: string;
  name: string;
  interests: string[];
  budget: number;
  food: "any" | "veg" | "nonveg";
  walking: "low" | "medium" | "high";
  votes: string[];
};

export type Expense = { id: string; label: string; category: string; amount: number; paidBy: string };

export type Trip = {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  groupSize: number;
  interests: string[];
  walking: "low" | "medium" | "high";
  transport: "any" | "public" | "cab" | "own";
  status: "upcoming" | "active" | "past";
  days: { id: string; label: string; items: ItineraryItem[] }[];
  members: Member[];
  packing: { id: string; text: string; done: boolean }[];
  expenses: Expense[];
  offline: boolean;
  comments: { id: string; author: string; text: string }[];
};

export type Account = { email: string; name: string; onboarded: boolean } | null;

export type State = {
  account: Account;
  prefs: Prefs;
  saved: string[];
  trips: Trip[];
  businesses: Business[];
  reports: Report[];
  dismissedNotes: string[];
  emergencyLog: { id: string; target: string; at: string }[];
};

const KEY = "neonguide.state.v1";
const uid = () => Math.random().toString(36).slice(2, 9);

const daysBetween = (a: string, b: string) => {
  const d = (new Date(b).getTime() - new Date(a).getTime()) / 86_400_000;
  return Math.max(1, Math.min(7, Math.round(d) + 1));
};

const planToItems = (plan: Plan): ItineraryItem[] =>
  plan.items.map((i: PlanItem) =>
    i.kind === "visit"
      ? {
          id: uid(),
          startMin: i.startMin,
          endMin: i.endMin,
          kind: "visit" as const,
          title: i.label,
          placeId: i.placeId,
          cost: i.cost,
          note: i.why[0],
        }
      : {
          id: uid(),
          startMin: i.startMin,
          endMin: i.endMin,
          kind: "travel" as const,
          title: i.label,
          cost: i.cost,
          note: `${i.km} km`,
        },
  );

function seedTrip(): Trip {
  const prefs = defaultPrefs;
  const start = new Date();
  const end = new Date(Date.now() + 86_400_000);
  const dayPlans = [
    buildPlan({ hours: 9, budget: 4000, startMin: 9 * 60, prefs }),
    buildPlan({ hours: 8, budget: 3000, startMin: 10 * 60, prefs, variant: "experience" }),
  ];
  return {
    id: "trip-demo",
    title: "Weekend in the Old City",
    destination: "Hyderabad",
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
    budget: 7000,
    groupSize: 3,
    interests: ["History", "Food", "Culture"],
    walking: "medium",
    transport: "any",
    status: "active",
    days: dayPlans.map((p, i) => ({ id: uid(), label: `Day ${i + 1}`, items: planToItems(p) })),
    members: [
      { id: uid(), name: "You", interests: ["History"], budget: 2500, food: "any", walking: "medium", votes: ["charminar"] },
      { id: uid(), name: "Meera", interests: ["Food"], budget: 2200, food: "veg", walking: "low", votes: ["paradise"] },
      { id: uid(), name: "Arjun", interests: ["Shopping"], budget: 2300, food: "any", walking: "high", votes: ["laad-bazaar"] },
    ],
    packing: packingList(2, prefs).map((t) => ({ id: uid(), text: t, done: false })),
    expenses: [
      { id: uid(), label: "Cab from station", category: "Transport", amount: 240, paidBy: "You" },
      { id: uid(), label: "Breakfast for three", category: "Food", amount: 310, paidBy: "Meera" },
    ],
    offline: false,
    comments: [{ id: uid(), author: "Arjun", text: "Can we keep the bazaar for the evening?" }],
  };
}

const initial = (): State => ({
  account: null,
  prefs: defaultPrefs,
  saved: ["chai-house", "salarjung"],
  trips: [seedTrip()],
  businesses: BUSINESSES,
  reports: REPORTS,
  dismissedNotes: [],
  emergencyLog: [],
});

let state: State = initial();
let hydrated = false;
const listeners = new Set<() => void>();

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable — keep in-memory only */
  }
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<State>;
      state = { ...state, ...parsed, prefs: { ...defaultPrefs, ...(parsed.prefs ?? {}) } };
    }
  } catch {
    /* ignore corrupt payloads */
  }
  listeners.forEach((l) => l());
}

function set(next: Partial<State> | ((s: State) => Partial<State>)) {
  const patch = typeof next === "function" ? next(state) : next;
  state = { ...state, ...patch };
  persist();
  listeners.forEach((l) => l());
}

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  hydrate();
  return () => listeners.delete(cb);
};

const serverSnapshot = initial();

export function useStore(): State {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => serverSnapshot,
  );
}

/* ------------------------------------------------------------- mutations */

export const actions = {
  signIn(email: string, name?: string) {
    set({ account: { email, name: name ?? email.split("@")[0] ?? "Traveller", onboarded: false } });
  },
  signOut() {
    set({ account: null });
  },
  completeOnboarding(prefs: Partial<Prefs>) {
    set((s) => ({
      prefs: { ...s.prefs, ...prefs },
      account: s.account ? { ...s.account, onboarded: true, name: prefs.name ?? s.account.name } : s.account,
    }));
  },
  setPrefs(patch: Partial<Prefs>) {
    set((s) => ({ prefs: { ...s.prefs, ...patch } }));
  },
  toggleSaved(id: string) {
    set((s) => ({ saved: s.saved.includes(id) ? s.saved.filter((x) => x !== id) : [...s.saved, id] }));
  },
  createTrip(input: {
    title: string;
    destination: string;
    startDate: string;
    endDate: string;
    budget: number;
    groupSize: number;
    interests: string[];
    walking: "low" | "medium" | "high";
    transport: "any" | "public" | "cab" | "own";
  }) {
    const dayCount = daysBetween(input.startDate, input.endDate);
    const prefs: Prefs = {
      ...state.prefs,
      interests: input.interests.length ? input.interests : state.prefs.interests,
      walking: input.walking,
      groupSize: input.groupSize,
    };
    const perDay = Math.round(input.budget / dayCount);
    const variants = ["best", "experience", "cheap", "fast"] as const;
    const days = Array.from({ length: dayCount }, (_, i) => ({
      id: uid(),
      label: `Day ${i + 1}`,
      items: planToItems(
        buildPlan({
          hours: 9,
          budget: perDay,
          startMin: 9 * 60 + (i % 2) * 30,
          prefs,
          variant: variants[i % variants.length],
        }),
      ),
    }));
    const trip: Trip = {
      id: uid(),
      ...input,
      status: "upcoming",
      days,
      members: [
        {
          id: uid(),
          name: state.account?.name ?? state.prefs.name,
          interests: input.interests,
          budget: input.budget,
          food: state.prefs.veg ? "veg" : "any",
          walking: input.walking,
          votes: [],
        },
      ],
      packing: packingList(dayCount, prefs).map((t) => ({ id: uid(), text: t, done: false })),
      expenses: [],
      offline: false,
      comments: [],
    };
    set((s) => ({ trips: [trip, ...s.trips] }));
    return trip.id;
  },
  updateTrip(id: string, patch: Partial<Trip>) {
    set((s) => ({ trips: s.trips.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));
  },
  deleteTrip(id: string) {
    set((s) => ({ trips: s.trips.filter((t) => t.id !== id) }));
  },
  moveItem(tripId: string, dayId: string, itemId: string, dir: -1 | 1) {
    set((s) => ({
      trips: s.trips.map((t) => {
        if (t.id !== tripId) return t;
        return {
          ...t,
          days: t.days.map((d) => {
            if (d.id !== dayId) return d;
            const items = [...d.items];
            const i = items.findIndex((x) => x.id === itemId);
            const j = i + dir;
            if (i < 0 || j < 0 || j >= items.length) return d;
            const a = items[i]!;
            const b = items[j]!;
            items[i] = { ...b, startMin: a.startMin, endMin: a.startMin + (b.endMin - b.startMin) };
            items[j] = { ...a, startMin: b.startMin, endMin: b.startMin + (a.endMin - a.startMin) };
            return { ...d, items };
          }),
        };
      }),
    }));
  },
  removeItem(tripId: string, dayId: string, itemId: string) {
    set((s) => ({
      trips: s.trips.map((t) =>
        t.id === tripId
          ? { ...t, days: t.days.map((d) => (d.id === dayId ? { ...d, items: d.items.filter((i) => i.id !== itemId) } : d)) }
          : t,
      ),
    }));
  },
  addItem(tripId: string, dayId: string, item: Omit<ItineraryItem, "id">) {
    set((s) => ({
      trips: s.trips.map((t) =>
        t.id === tripId
          ? {
              ...t,
              days: t.days.map((d) =>
                d.id === dayId
                  ? { ...d, items: [...d.items, { ...item, id: uid() }].sort((a, b) => a.startMin - b.startMin) }
                  : d,
              ),
            }
          : t,
      ),
    }));
  },
  /** Add a place to the first trip (or a named trip) as a new stop. */
  addPlaceToTrip(placeId: string, title: string, tripId?: string) {
    const trip = state.trips.find((t) => t.id === tripId) ?? state.trips[0];
    if (!trip) return null;
    const day = trip.days[0];
    if (!day) return null;
    const last = day.items[day.items.length - 1];
    const startMin = last ? last.endMin + 15 : 10 * 60;
    actions.addItem(trip.id, day.id, {
      startMin,
      endMin: startMin + 60,
      kind: "visit",
      title,
      placeId,
      cost: 0,
      note: "Added from discovery",
    });
    return trip.id;
  },
  addExpense(tripId: string, e: Omit<Expense, "id">) {
    set((s) => ({
      trips: s.trips.map((t) => (t.id === tripId ? { ...t, expenses: [...t.expenses, { ...e, id: uid() }] } : t)),
    }));
  },
  removeExpense(tripId: string, id: string) {
    set((s) => ({
      trips: s.trips.map((t) => (t.id === tripId ? { ...t, expenses: t.expenses.filter((x) => x.id !== id) } : t)),
    }));
  },
  togglePacking(tripId: string, id: string) {
    set((s) => ({
      trips: s.trips.map((t) =>
        t.id === tripId ? { ...t, packing: t.packing.map((p) => (p.id === id ? { ...p, done: !p.done } : p)) } : t,
      ),
    }));
  },
  addPacking(tripId: string, text: string) {
    set((s) => ({
      trips: s.trips.map((t) => (t.id === tripId ? { ...t, packing: [...t.packing, { id: uid(), text, done: false }] } : t)),
    }));
  },
  removePacking(tripId: string, id: string) {
    set((s) => ({
      trips: s.trips.map((t) => (t.id === tripId ? { ...t, packing: t.packing.filter((p) => p.id !== id) } : t)),
    }));
  },
  addMember(tripId: string, m: Omit<Member, "id">) {
    set((s) => ({ trips: s.trips.map((t) => (t.id === tripId ? { ...t, members: [...t.members, { ...m, id: uid() }] } : t)) }));
  },
  removeMember(tripId: string, id: string) {
    set((s) => ({ trips: s.trips.map((t) => (t.id === tripId ? { ...t, members: t.members.filter((m) => m.id !== id) } : t)) }));
  },
  vote(tripId: string, memberId: string, placeId: string) {
    set((s) => ({
      trips: s.trips.map((t) =>
        t.id === tripId
          ? {
              ...t,
              members: t.members.map((m) =>
                m.id === memberId
                  ? { ...m, votes: m.votes.includes(placeId) ? m.votes.filter((v) => v !== placeId) : [...m.votes, placeId] }
                  : m,
              ),
            }
          : t,
      ),
    }));
  },
  addComment(tripId: string, author: string, text: string) {
    set((s) => ({
      trips: s.trips.map((t) => (t.id === tripId ? { ...t, comments: [...t.comments, { id: uid(), author, text }] } : t)),
    }));
  },
  toggleOffline(tripId: string) {
    set((s) => ({ trips: s.trips.map((t) => (t.id === tripId ? { ...t, offline: !t.offline } : t)) }));
  },
  replaceDay(tripId: string, dayId: string, items: ItineraryItem[]) {
    set((s) => ({
      trips: s.trips.map((t) => (t.id === tripId ? { ...t, days: t.days.map((d) => (d.id === dayId ? { ...d, items } : d)) } : t)),
    }));
  },
  planToItems,
  dismissNote(id: string) {
    set((s) => ({ dismissedNotes: [...s.dismissedNotes, id] }));
  },
  logEmergency(target: string) {
    set((s) => ({
      emergencyLog: [{ id: uid(), target, at: new Date().toISOString() }, ...s.emergencyLog].slice(0, 20),
    }));
  },
  /* business portal */
  upsertBusiness(b: Business) {
    set((s) => ({
      businesses: s.businesses.some((x) => x.id === b.id)
        ? s.businesses.map((x) => (x.id === b.id ? b : x))
        : [...s.businesses, b],
    }));
  },
  createBusiness(input: { name: string; category: string; hours: string }) {
    const b: Business = {
      id: uid(),
      name: input.name,
      category: input.category,
      status: "pending",
      views: 0,
      searchAppearances: 0,
      saves: 0,
      offerClicks: 0,
      availability: "unknown",
      hours: input.hours,
      updatedHoursAgo: 0,
      offers: [],
      menu: [],
    };
    set((s) => ({ businesses: [...s.businesses, b] }));
    return b.id;
  },
  setBusinessAvailability(id: string, availability: Availability) {
    set((s) => ({ businesses: s.businesses.map((b) => (b.id === id ? { ...b, availability, updatedHoursAgo: 0 } : b)) }));
  },
  setBusinessMenu(id: string, menu: MenuItem[]) {
    set((s) => ({ businesses: s.businesses.map((b) => (b.id === id ? { ...b, menu, updatedHoursAgo: 0 } : b)) }));
  },
  addOffer(id: string, title: string, detail: string) {
    set((s) => ({
      businesses: s.businesses.map((b) =>
        b.id === id ? { ...b, offers: [...b.offers, { id: uid(), title, detail, active: true }] } : b,
      ),
    }));
  },
  toggleOffer(id: string, offerId: string) {
    set((s) => ({
      businesses: s.businesses.map((b) =>
        b.id === id ? { ...b, offers: b.offers.map((o) => (o.id === offerId ? { ...o, active: !o.active } : o)) } : b,
      ),
    }));
  },
  setBusinessStatus(id: string, status: "published" | "pending") {
    set((s) => ({ businesses: s.businesses.map((b) => (b.id === id ? { ...b, status } : b)) }));
  },
  resolveReport(id: string) {
    set((s) => ({ reports: s.reports.map((r) => (r.id === id ? { ...r, status: "resolved" } : r)) }));
  },
  reportPlace(placeId: string, type: Report["type"], detail: string) {
    set((s) => ({
      reports: [{ id: uid(), placeId, type, detail, reportedHoursAgo: 0, status: "open" }, ...s.reports],
    }));
  },
  reset() {
    state = initial();
    persist();
    listeners.forEach((l) => l());
  },
};
