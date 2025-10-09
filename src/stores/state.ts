import { defineStore } from 'pinia';
import { SessionStorage } from 'quasar';
import { HA, HAA, ha2n } from 'src/components/models';

export const STATE_STORAGE_KEY = 'state';

interface StatePool {
  empty: false;
  team: false;
  contestants: string[];
  bouts: [number, number][];
  results: [number, number][];
  cards: [boolean, boolean][];
  currentBout: number;
  time: number;
  overtime: number;
  challenges: number;
  challengesRemaining: [number, number][];
  currentTime: number;
  cap: number | undefined;
}

interface StateTeam {
  empty: false;
  team: true;
  names: [string, string];
  contestants: [string[], string[]];
  bouts: [number, number][];
  currentBout: number;
  time: number;
  challenges: number;
  overtime: number;
  timeoutTime: number;
  timeouts: number;
  score: [number, number];
  cards: [number[], number[]];
  challengesRemaining: [number, number];
  timeoutsRemaining: [number, number];
  currentTime: number;
  cap: number | undefined;
}

interface StateEmpty {
  empty: true;
}

interface State {
  inner: StatePool | StateTeam | StateEmpty;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const emptyState: State = {
  inner: {
    empty: true,
  },
};

const boutsBySize: Map<number, [number, number][]> = new Map<
  number,
  [number, number][]
>([
  [
    4,
    [
      [0, 3],
      [1, 2],
      [2, 0],
      [3, 1],
      [0, 1],
      [2, 3],
    ],
  ],
  [
    5,
    [
      [4, 1],
      [3, 0],
      [2, 4],
      [1, 3],
      [0, 2],
      [3, 4],
      [1, 2],
      [4, 0],
      [2, 3],
      [0, 1],
    ],
  ],
  [
    6,
    [
      [0, 5],
      [1, 4],
      [3, 2],
      [4, 0],
      [5, 3],
      [2, 1],
      [0, 3],
      [4, 2],
      [1, 5],
      [2, 0],
      [3, 1],
      [5, 4],
      [0, 1],
      [2, 5],
      [4, 3],
    ],
  ],
  [
    7,
    [
      [6, 1],
      [0, 3],
      [2, 5],
      [4, 6],
      [1, 3],
      [5, 0],
      [2, 4],
      [3, 6],
      [5, 1],
      [4, 0],
      [6, 2],
      [3, 5],
      [1, 4],
      [0, 2],
      [5, 6],
      [3, 4],
      [1, 2],
      [6, 0],
      [4, 5],
      [2, 3],
      [0, 1],
    ],
  ],
  [
    8,
    [
      [0, 7],
      [1, 6],
      [5, 2],
      [3, 4],
      [6, 0],
      [7, 5],
      [4, 1],
      [2, 3],
      [0, 5],
      [6, 4],
      [3, 7],
      [0, 5],
      [1, 2],
      [4, 0],
      [5, 3],
      [2, 6],
      [7, 1],
      [0, 3],
      [4, 2],
      [1, 5],
      [6, 7],
      [2, 0],
      [3, 1],
      [7, 4],
      [5, 6],
      [0, 1],
      [6, 3],
      [4, 5],
    ],
  ],
  [
    9,
    [
      [8, 1],
      [0, 3],
      [2, 5],
      [4, 7],
      [6, 8],
      [1, 3],
      [5, 0],
      [7, 2],
      [4, 6],
      [8, 3],
      [1, 5],
      [7, 0],
      [2, 6],
      [4, 8],
      [3, 5],
      [7, 1],
      [6, 0],
      [2, 4],
      [5, 8],
      [3, 7],
      [6, 1],
      [0, 4],
      [8, 2],
      [5, 7],
      [3, 6],
      [1, 4],
      [0, 2],
      [7, 8],
      [5, 6],
      [3, 4],
      [1, 2],
      [8, 0],
      [6, 7],
      [4, 5],
      [2, 3],
      [0, 1],
    ],
  ],
  [
    10,
    [
      [0, 9],
      [1, 8],
      [7, 2],
      [3, 6],
      [5, 4],
      [8, 0],
      [9, 7],
      [6, 1],
      [2, 5],
      [4, 3],
      [0, 7],
      [8, 6],
      [5, 9],
      [1, 4],
      [3, 2],
      [6, 0],
      [7, 5],
      [4, 8],
      [9, 3],
      [2, 1],
      [0, 5],
      [6, 4],
      [3, 7],
      [8, 2],
      [1, 9],
      [4, 0],
      [5, 3],
      [2, 6],
      [7, 1],
      [9, 8],
      [0, 3],
      [4, 2],
      [1, 5],
      [6, 9],
      [8, 7],
      [2, 0],
      [3, 1],
      [9, 4],
      [5, 8],
      [7, 6],
      [0, 1],
      [2, 9],
      [8, 3],
      [4, 7],
      [6, 5],
    ],
  ],
]);

export const useStateStore = defineStore('state', {
  state: (): State => {
    const rawState = SessionStorage.getItem(STATE_STORAGE_KEY);
    if (rawState === null) {
      return emptyState;
    }
    return rawState as State;
  }, //testState,
  getters: {
    isEmpty: (state) => state.inner.empty === true,
    isPrev: (state) => !state.inner.empty && state.inner.currentBout > 0,
    isNext: (state) =>
      !state.inner.empty &&
      state.inner.currentBout + 1 < state.inner.bouts.length,
    teamName: (state) => (who: HA) => {
      if (state.inner.empty || !state.inner.team) {
        return undefined;
      }
      return state.inner.names[ha2n(who)];
    },
    name:
      (state) =>
      (who: HA, i = 0, rel = true) => {
        if (state.inner.empty) {
          return undefined;
        }
        const n = rel ? state.inner.currentBout + i : i;
        if (n < 0 || n >= state.inner.bouts.length) {
          return undefined;
        }
        if (state.inner.team) {
          return state.inner.contestants[ha2n(who)][
            state.inner.bouts[n][ha2n(who)]
          ];
        } else {
          return state.inner.contestants[state.inner.bouts[n][ha2n(who)]];
        }
      },
    score:
      (state) =>
      (who: HA, i = 0, rel = true) => {
        if (state.inner.empty) {
          return undefined;
        }
        if (state.inner.team) {
          return state.inner.score[ha2n(who)];
        } else {
          const n = rel ? state.inner.currentBout + i : i;
          if (n < 0 || n >= state.inner.results.length) {
            return undefined;
          }
          return state.inner.results[n][ha2n(who)];
        }
      },
    card:
      (state) =>
      (who: HA, i = 0, rel = true) => {
        if (state.inner.empty) {
          return false;
        }
        const n = rel ? state.inner.currentBout + i : i;
        if (n < 0 || n >= state.inner.bouts.length) {
          return false;
        }
        if (state.inner.team) {
          for (const i of state.inner.cards[ha2n(who)]) {
            if (i === state.inner.bouts[n][ha2n(who)]) {
              return true;
            }
          }
          return false;
        } else {
          if (n < 0 || n >= state.inner.cards.length) {
            return false;
          }
          return state.inner.cards[n][ha2n(who)];
        }
      },
    challenges: (state) => (who: HA) => {
      if (state.inner.empty) {
        return undefined;
      }
      const s = ha2n(who);
      if (state.inner.team) {
        return state.inner.challengesRemaining[s];
      } else if (state.inner.currentBout >= 0) {
        return state.inner.challengesRemaining[state.inner.currentBout][s];
      } else {
        return undefined;
      }
    },
    timeouts: (state) => (who: HA) => {
      if (state.inner.empty) {
        return undefined;
      }
      if (state.inner.team) {
        return state.inner.timeoutsRemaining[ha2n(who)];
      } else {
        return undefined;
      }
    },
  },
  actions: {
    initList(options: {
      pairs: [string, string][];
      time: number;
      overtime: number;
      challenges: number;
      cap: number | undefined;
    }) {
      const contestants = [
        ...options.pairs.map((x) => x[0]),
        ...options.pairs.map((x) => x[1]),
      ];
      const bouts: [number, number][] = options.pairs.map((_, i) => [
        i,
        options.pairs.length + i,
      ]);
      if (bouts === undefined) {
        return;
      }
      this.inner = {
        empty: false,
        team: false,
        contestants: contestants,
        bouts: bouts,
        currentBout: -1,
        results: bouts.map(() => [0, 0]),
        cards: bouts.map(() => [false, false]),
        time: options.time,
        overtime: options.overtime,
        challenges: options.challenges,
        challengesRemaining: bouts.map(() => [
          options.challenges,
          options.challenges,
        ]),
        currentTime: options.time,
        cap: options.cap,
      };
    },
    initPool(options: {
      contestants: string[];
      time: number;
      overtime: number;
      cap: number | undefined;
    }) {
      const bouts: [number, number][] | undefined = boutsBySize.get(
        options.contestants.length
      );
      if (bouts === undefined) {
        return;
      }
      this.inner = {
        empty: false,
        team: false,
        contestants: options.contestants,
        bouts: bouts,
        currentBout: -1,
        results: bouts.map(() => [0, 0]),
        cards: bouts.map(() => [false, false]),
        time: options.time,
        overtime: options.overtime,
        challenges: 0,
        challengesRemaining: bouts.map(() => [0, 0]),
        currentTime: options.time,
        cap: options.cap,
      };
    },
    initTeam(options: {
      home: {
        name: string;
        contestants: string[];
      };
      away: {
        name: string;
        contestants: string[];
      };
      time: number;
      overtime: number;
      challenges: number;
      timeoutTime: number;
      timeouts: number;
      cap: number | undefined;
    }) {
      const bouts: [number, number][] = [
        [2, 2],
        [0, 1],
        [1, 0],
        [0, 2],
        [2, 0],
        [1, 1],
        [0, 0],
        [1, 2],
        [2, 1],
      ];
      this.inner = {
        empty: false,
        team: true,
        names: [options.home.name, options.away.name],
        contestants: [options.home.contestants, options.away.contestants],
        bouts: bouts,
        currentBout: -1,
        time: options.time,
        overtime: options.overtime,
        challenges: options.challenges,
        timeoutTime: options.timeoutTime,
        timeouts: options.timeouts,
        score: [0, 0],
        cards: [[], []],
        challengesRemaining: [options.challenges, options.challenges],
        timeoutsRemaining: [options.timeouts, options.timeouts],
        currentTime: options.time,
        cap: options.cap,
      };
    },
    changeCurrentScore(who: HAA, amount: number) {
      if (this.inner.empty) {
        return;
      }
      const r = this.inner.team
        ? this.inner.score
        : this.inner.results[this.inner.currentBout];
      if (who === 'home') {
        r[0] += amount;
      } else if (who === 'away') {
        r[1] += amount;
      } else {
        r[0] += amount;
        r[1] += amount;
      }
    },
    changeCurrentCard(who: HA, val: boolean) {
      if (this.inner.empty) {
        return;
      }
      const s = ha2n(who);
      if (this.inner.team) {
        const c = this.inner.cards[ha2n(who)];
        const id = this.inner.bouts[this.inner.currentBout][s];
        let idx = -1;
        for (let i = 0; i < c.length; i++) {
          if (c[i] === id) {
            idx = i;
            break;
          }
        }
        if (idx === -1 && val) {
          c.push(id);
        } else if (idx !== -1 && !val) {
          c.splice(idx, 1);
        }
      } else {
        this.inner.cards[this.inner.currentBout][s] = val;
      }
    },
    changeTeamCard(who: HA, val: boolean) {
      if (this.inner.empty || !this.inner.team) {
        return;
      }
      const s = ha2n(who);
      this.inner.cards[s] = val
        ? this.inner.contestants[s].map((c, i) => i)
        : [];
    },
    changeCurrentChallenges(who: HA, amount: number) {
      if (this.inner.empty) {
        return;
      }
      const s = ha2n(who);
      if (this.inner.team) {
        this.inner.challengesRemaining[s] = Math.max(
          this.inner.challengesRemaining[s] + amount,
          0
        );
      } else {
        this.inner.challengesRemaining[this.inner.currentBout][s] = Math.max(
          this.inner.challengesRemaining[this.inner.currentBout][s] + amount,
          0
        );
      }
    },
    changeCurrentTimeouts(who: HA, amount: number) {
      if (this.inner.empty || !this.inner.team) {
        return;
      }
      this.inner.timeoutsRemaining[ha2n(who)] = Math.max(
        this.inner.timeoutsRemaining[ha2n(who)] + amount,
        0
      );
    },
    nextBout(prev = false) {
      if (this.inner.empty) {
        return;
      }
      if (prev) {
        this.inner.currentBout--;
      } else {
        this.inner.currentBout++;
      }
    },
  },
});
