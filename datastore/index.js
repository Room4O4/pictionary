let _users = [];

const _validateLogin = async (user) => {
  //Make db call
  return Promise.resolve(true);
};

exports.login = async (user) => {
  if (user) {
    if (await _validateLogin(user)) {
      _users.push(user);
      return true;
    } else {
      throw new Error('user could not be logged in');
    }
  } else {
    throw new Error('user cannot be null');
  }
};

exports.getUser = async (id) => {
  if (!id) {
    throw new Error('userId must be non-null in getUser');
  }
  const result = await Promise.resolve(_users.find((user) => user.id === id));
  return result;
};
