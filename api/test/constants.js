// TODO: config
const apiPrefix = '';

module.exports = {
  endpoints: {
    // users: (id) => id ? `${apiPrefix}/user/${id}` : `${apiPrefix}/users`,
    // usersProfile: `${apiPrefix}/users/profile`,

    logout: `${apiPrefix}/auth/logout`,
    profile: `${apiPrefix}/auth/profile`,
    login: `${apiPrefix}/auth/login`,
    register: `${apiPrefix}/auth/register`,

    usersLanguage: `${apiPrefix}/users/language`,

    dictionaries: (slug) =>
      slug ? `${apiPrefix}/dictionaries/${slug}` : `${apiPrefix}/dictionaries`,
    dictionaryWordSets: (dictionarySlug, wordSetSlug) =>
      wordSetSlug
        ? `${apiPrefix}/dictionaries/${dictionarySlug}/wordsets/${wordSetSlug}`
        : `${apiPrefix}/dictionaries/${dictionarySlug}/wordsets`,
    dictionaryWordsetWords: (dictionaryId, wordSetId, wordId) =>
      wordId
        ? `${apiPrefix}/dictionaries/${dictionaryId}/wordsets/${wordSetId}/words/${wordId}`
        : `${apiPrefix}/dictionaries/${dictionaryId}/wordsets/${wordSetId}/words`,
    dictionaryWords: (dictionaryId) => `${apiPrefix}/dictionaries/${dictionaryId}/words`,

    words: (id) =>
      id ? `${apiPrefix}/dictionaries/words/${id}` : `${apiPrefix}/dictionaries/words`,
    wordsBunchAdd: (dictionaryId, wordSetId) =>
      `${apiPrefix}/dictionaries/${dictionaryId}/wordsets/${wordSetId}/words/bunch-add`,

    translate: `${apiPrefix}/translate`,
  },
};
