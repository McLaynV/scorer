<template>
  <div class="container">
    <q-form @submit="submit">
      <div class="q-py-md">
        Mode:
        <q-radio
          v-model="mode"
          :val="ModeList"
          :label="$t('scorerSetup.list.label')"
        />
        <q-radio
          v-model="mode"
          :val="ModeGroup"
          :label="$t('scorerSetup.pool.label')"
        />
        <q-radio
          v-model="mode"
          :val="ModeTeam"
          :label="$t('scorerSetup.team.label')"
        />
      </div>
      <q-card v-if="mode === ModeList" class="q-py-md">
        <q-card-section class="text-h5">
          {{ $t('scorerSetup.bouts') }}
        </q-card-section>
        <q-card-section>
          <div
            v-for="(cs, i) in contestantsPairs"
            :key="`${cs[0].key}_${cs[1].key}`"
            class="row q-gutter-sm items-center"
          >
            <div class="col-shrink">{{ i + 1 }}.</div>
            <div class="col"><q-input v-model="contestantsHome[i].name" /></div>
            <div class="col"><q-input v-model="contestantsAway[i].name" /></div>
            <div class="col-shrink">
              <q-btn @click="removePair(i)" :icon="mdiTrashCan" flat round />
            </div>
          </div>
          <div class="row q-pa-md">
            <q-space />
            <q-btn @click="addPair()" :icon="mdiPlus" round />
          </div>
        </q-card-section>
        <q-card-section>
          <div>
            <q-input
              v-model.number="time"
              :label="$t('scorerSetup.pool.time')"
            />
            <q-input
              v-model.number="overtime"
              :label="$t('scorerSetup.overtime')"
            />
            <q-input
              v-model.number="challenges"
              :label="$t('scorerSetup.challenges')"
            />
            <q-input
              v-model.number="cap"
              :label="$t('scorerSetup.pool.cap')"
              :hint="$t('scorerSetup.pool.capHint')"
            />
          </div>
        </q-card-section>
      </q-card>
      <q-card v-else-if="mode === ModeGroup" class="q-py-md">
        <q-card-section class="text-h5">
          {{ $t('scorerSetup.contestants') }}
        </q-card-section>
        <q-card-section>
          <div v-for="(c, i) in contestantsHome" :key="c.key">
            <q-input v-model="contestantsHome[i].name">
              <template #prepend> {{ i + 1 }}. </template>
              <template #append>
                <q-btn
                  @click="removeContestant(i)"
                  :icon="mdiTrashCan"
                  flat
                  round
                />
              </template>
            </q-input>
          </div>
          <div class="row q-pa-md">
            <q-space />
            <q-btn @click="addContestant()" :icon="mdiPlus" round />
          </div>
        </q-card-section>
        <q-card-section>
          <div>
            <q-input
              v-model.number="time"
              :label="$t('scorerSetup.pool.time')"
            />
            <q-input
              v-model.number="overtime"
              :label="$t('scorerSetup.overtime')"
            />
            <q-input
              v-model.number="challenges"
              :label="$t('scorerSetup.challenges')"
            />
            <q-input
              v-model.number="cap"
              :label="$t('scorerSetup.pool.cap')"
              :hint="$t('scorerSetup.pool.capHint')"
            />
          </div>
        </q-card-section>
      </q-card>
      <q-card v-else-if="mode === ModeTeam" class="q-pa-md">
        <q-card-section horizontal class="q-gutter-md">
          <q-card-section class="col">
            <div class="text-h5">
              {{ $t('scorerSetup.team.home') }}
            </div>
            <div>
              <q-input v-model="teamHome" />
            </div>
            <div v-for="(c, i) in contestantsHome" :key="c.key">
              <q-input v-model="c.name">
                <template #prepend>{{ i + 1 }}.</template>
              </q-input>
            </div>
          </q-card-section>
          <q-separator vertical />
          <q-card-section class="col">
            <div class="text-h5">
              {{ $t('scorerSetup.team.away') }}
            </div>
            <div>
              <q-input v-model="teamAway" />
            </div>
            <div v-for="(c, i) in contestantsAway" :key="c.key">
              <q-input v-model="c.name">
                <template #prepend>{{ i + 1 }}.</template>
              </q-input>
            </div>
          </q-card-section>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <div>
            <q-input
              v-model.number="time"
              :label="$t('scorerSetup.team.time')"
            />
            <q-input
              v-model.number="overtime"
              :label="$t('scorerSetup.overtime')"
            />
            <q-input
              v-model.number="challenges"
              :label="$t('scorerSetup.challenges')"
            />
            <q-input
              v-model.number="timeoutTime"
              :label="$t('scorerSetup.team.timeoutTime')"
            />
            <q-input
              v-model.number="timeouts"
              :label="$t('scorerSetup.team.timeouts')"
            />
            <q-input
              v-model.number="cap"
              :label="$t('scorerSetup.team.cap')"
              :hint="$t('scorerSetup.team.capHint')"
            />
          </div>
        </q-card-section>
      </q-card>
      <q-separator />
      <div>
        <q-btn label="Submit" type="submit" color="primary" />
      </div>
    </q-form>
  </div>
</template>

<script setup lang="ts">
import { SessionStorage, uid } from 'quasar';
import { computed, ref, watch } from 'vue';
import { mdiPlus, mdiTrashCan } from '@quasar/extras/mdi-v7';
import { useStateStore } from 'src/stores/state';
import { HA, Mode, ModeGroup, ModeList, ModeTeam } from './models';

const state = useStateStore();

const mode = ref<Mode>(ModeList);

interface Contestant {
  key: string;
  name: string;
}

const teamHome = ref<string>('');
const teamAway = ref<string>('');
const contestantsHome = ref<Contestant[]>([]);
const contestantsAway = ref<Contestant[]>([]);
const contestantsPairs = computed<[Contestant, Contestant][]>(() => {
  const l = Math.min(
    contestantsHome.value.length,
    contestantsAway.value.length
  );
  const res = Array<[Contestant, Contestant]>(l);
  for (let i = 0; i < l; i++) {
    res[i] = [contestantsHome.value[i], contestantsAway.value[i]];
  }
  return res;
});

const time = ref<number>(SessionStorage.getItem('setup.time') ?? 0);
const overtime = ref<number>(SessionStorage.getItem('setup.overtime') ?? 0);
const challenges = ref<number>(SessionStorage.getItem('setup.challenges') ?? 0);
const timeoutTime = ref<number>(
  SessionStorage.getItem('setup.timeoutTime') ?? 0
);
const timeouts = ref<number>(SessionStorage.getItem('setup.timeouts') ?? 0);
const cap = ref<number | undefined>(
  SessionStorage.getItem<number>('setup.cap') ?? undefined
);

watch(mode, (newVal) => {
  if (newVal === ModeTeam) {
    contestantsHome.value = [
      {
        key: uid(),
        name: '',
      },
      {
        key: uid(),
        name: '',
      },
      {
        key: uid(),
        name: '',
      },
      {
        key: uid(),
        name: '',
      },
    ];
    contestantsAway.value = [
      {
        key: uid(),
        name: '',
      },
      {
        key: uid(),
        name: '',
      },
      {
        key: uid(),
        name: '',
      },
      {
        key: uid(),
        name: '',
      },
    ];
  } else if (newVal === ModeGroup) {
    contestantsHome.value = [];
    contestantsAway.value = [];
  }
});

watch(time, (newVal) => SessionStorage.setItem('setup.time', newVal));
watch(overtime, (newVal) => SessionStorage.setItem('setup.overtime', newVal));
watch(challenges, (newVal) =>
  SessionStorage.setItem('setup.challenges', newVal)
);
watch(timeoutTime, (newVal) =>
  SessionStorage.setItem('setup.timeoutTime', newVal)
);
watch(timeouts, (newVal) => SessionStorage.setItem('setup.timeouts', newVal));
watch(cap, (newVal) => SessionStorage.setItem('setup.cap', newVal));

function addContestant(t: HA = 'home') {
  const c = t === 'home' ? contestantsHome : contestantsAway;
  c.value.push({
    key: uid(),
    name: '',
  });
}

function removeContestant(idx: number, t: HA = 'home') {
  const c = t === 'home' ? contestantsHome : contestantsAway;
  c.value.splice(idx, 1);
}

function addPair() {
  contestantsHome.value.push({
    key: uid(),
    name: '',
  });
  contestantsAway.value.push({
    key: uid(),
    name: '',
  });
}

function removePair(idx: number) {
  contestantsHome.value.splice(idx, 1);
  contestantsAway.value.splice(idx, 1);
}

function submit() {
  console.log('submit');
  switch (mode.value) {
    case ModeList:
      const pairs: [string, string][] = contestantsPairs.value.map((cs) => [
        cs[0].name,
        cs[1].name,
      ]);
      state.initList({
        pairs: pairs,
        time: time.value,
        overtime: overtime.value,
        cap: cap.value,
        challenges: challenges.value,
      });
      break;
    case ModeGroup:
      const cs = contestantsHome.value.map((c) => c.name);
      state.initPool({
        contestants: cs,
        time: time.value,
        overtime: overtime.value,
        cap: cap.value,
      });
      break;
    case ModeTeam:
      const csh = contestantsHome.value.map((c) => c.name);
      const csa = contestantsAway.value.map((c) => c.name);
      state.initTeam({
        home: {
          name: teamHome.value,
          contestants: csh,
        },
        away: {
          name: teamAway.value,
          contestants: csa,
        },
        time: time.value,
        overtime: overtime.value,
        challenges: challenges.value,
        timeoutTime: timeoutTime.value,
        timeouts: timeouts.value,
        cap: cap.value,
      });
      break;
  }
}
</script>

<style lang="scss" scoped>
.container {
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}
</style>
