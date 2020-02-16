/* eslint-disable import/extensions */
/* eslint-disable no-use-before-define */
import { getTitle, getAvatar } from '@/utils/helpers';

export const state = {
  blockstackUserSession: null,
  userData: null,
  storeFileExists: false,
  userFiles: [],
  storageFile: 'smalltalk_account.json',
  storageFileData: null,
  showOnboardingWizard: false,
  newSmallTalkStoreStructure: {
    credit: {
      id: null,
      amount: null,
      description: null,
      currency: null,
      fiatAmount: null,
      fiatValue: null,
      subscribedOn: null,
      validUntil: null,
      uri: null,
    },
    theme: null,
  },
};

export const mutations = {
  SET_USER_SESSION(state, userSession) {
    state.blockstackUserSession = userSession || null;
  },
  SET_USER_DATA(state, userData) {
    state.userData = userData;
  },
  SET_INITIAL_CONFIG(state) {
    state.newSmallTalkStoreStructure.theme = '/ocean';
  },
  ANNOUNCE_FILE_EXISTS_STATE(state) {
    state.storeFileExists = true;
  },
  SET_STORAGE_FILE_DATA(state, encryptedData) {
    state.storageFileData = JSON.parse(encryptedData);
  },
  SAVE_WORKSPACE(state) {
    state.blockstackUserSession.putFile(
      state.storageFile,
      JSON.stringify(state.storageFileData),
    );
  },
  SAVE_WORKSPACE_AND_LOGOUT(state) {
    state.blockstackUserSession.putFile(
      state.storageFile,
      JSON.stringify(state.storageFileData),
    ).then(() => {
      state.blockstackUserSession.signUserOut(window.location.href);
    });
  },
  SET_ON_BOARDING_WIZARD_STATE(state, flag) {
    state.showOnboardingWizard = flag;
  },
  SET_USER_FILE_LIST(state, list) {
    state.userFiles = list;
  },
  SET_USER_THEME(state, theme) {
    state.storageFileData.theme = theme;
  },
  SET_USER_CREDITS(state, credit) {
    state.storageFileData.credit = credit;
  },
};

export const actions = {
  // eslint-disable-next-line no-unused-vars
  async LOGIN_USER({ commit, state, dispatch }, session) {
    console.log('Commiting blockstackUserSession state');
    commit('SET_USER_SESSION', session);
    console.log('Commiting blockstackUserSession state');
    console.log('Commiting userData state');
    commit('SET_USER_DATA', session.loadUserData());
    console.log('Commited userData state');
    console.log('Dispatching SETUP action');
    await dispatch('SETUP');
    console.log('Dispatched SETUP action');
  },
  async SETUP({ commit, state }) {
    try {
      // Save loggedin user's private key on gaia
      commit('SET_INITIAL_CONFIG');

      // Check if the database is already present for this user
      console.log('Calling validateSmallTalkJSONFileExists method');
      await validateSmallTalkJSONFileExists(commit, state);
      console.log('Called validateSmallTalkJSONFileExists method');

      // Create if file not present
      console.log(
        `Checking state of storeFileExists: ${state.storeFileExists}`,
      );
      if (!state.storeFileExists) {
        commit('SET_ON_BOARDING_WIZARD_STATE', true);
        console.log('Inside storeFileExists does not exists if loop');
        console.log('Calling createSmallTalkJSONFileOnGaiaHub method');
        await createSmallTalkJSONFileOnGaiaHub(state);
        console.log('Called createSmallTalkJSONFileOnGaiaHub method');
        console.log('Dispatching SETUP action');
      }

      // Get the new file / existing file created from Gaia hub
      console.log('Calling getSmallTalkJSONFile method');
      getSmallTalkJSONFile(commit, state);
      console.log('Called getSmallTalkJSONFile method');

      console.log('Completed SETUP action');
    } catch (exceptionError) {
      console.log(exceptionError);
      console.error(
        'ABORT: CANNOT GET DATA FROM SERVER -- blockstackAuth.SETUP exception',
      );
    }
  },
  async SAVE_AND_LOGOUT({ commit }) {
    commit('SAVE_WORKSPACE_AND_LOGOUT');
  },
  SET_ONBOARDING_MODAL_STATE({ commit }, flag) {
    commit('SET_ON_BOARDING_WIZARD_STATE', flag);
  },
  SAVE_THEME({ commit }, theme) {
    commit('SAVE_USER_THEME', theme);
    commit('SAVE_WORKSPACE');
  },
  SAVE_CREDITS({ commit }, credit) {
    commit('SET_USER_CREDITS', credit);
    commit('SAVE_WORKSPACE');
  },
};

export const getters = {
  name: (state) => (state.userData !== null ? getTitle(state.userData) : '----'),
  avatar: (state) => (state.userData !== null ? getAvatar(state.userData) : null),
  username: (state) =>
    (state.userData !== null ? state.userData.email : '----'),
};

async function validateSmallTalkJSONFileExists(commit, state) {
  console.log('Inside validateSmallTalkJSONFileExists function');
  const smalltalkUserDataFile = state.storageFile;
  const blockstackListFiles = [];
  console.log('inside file list');
  await state.blockstackUserSession.listFiles((filename) => {
    blockstackListFiles.push(filename);
    return true;
  });
  commit('SET_USER_FILE_LIST', blockstackListFiles);
  if (state.userFiles.includes(smalltalkUserDataFile)) {
    console.log('Commiting to announce that file exists');
    commit('ANNOUNCE_FILE_EXISTS_STATE', true);
    console.log('Commited to announce that file exists');
  }
  console.log('Exiting validateSmallTalkJSONFileExists function');
}

async function createSmallTalkJSONFileOnGaiaHub(state) {
  console.log('Inside createSmallTalkJSONFileOnGaiaHub function');
  console.log('Uploading smalltalk_data.json to gaia');

  await state.blockstackUserSession.putFile(
    state.storageFile,
    JSON.stringify(state.newSmallTalkStoreStructure),
  );
  console.log('Exiting createSmallTalkJSONFileOnGaiaHub function');
}

async function getSmallTalkJSONFile(commit, state) {
  await state.blockstackUserSession
    .getFile(state.storageFile)
    .then((responseData) => {
      if (responseData && responseData.length > 0) {
        commit('SET_STORAGE_FILE_DATA', responseData);
      }
    });
}
