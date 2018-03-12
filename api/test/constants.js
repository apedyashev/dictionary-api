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

    dictionaries: (slug) =>
      slug ? `${apiPrefix}/dictionaries/${slug}` : `${apiPrefix}/dictionaries`,
    dictionaryWordSets: (dictionarySlug, wordSetSlug) =>
      `${apiPrefix}/dictionaries/${dictionarySlug}/wordsets/${wordSetSlug}`,
    dictionaryWords: (dictionaryId, wordSetId) =>
      `${apiPrefix}/dictionaries/${dictionaryId}/wordsets/${wordSetId}/words`,
  },
};
