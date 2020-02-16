/* eslint-disable block-scoped-var */
/* eslint-disable no-var */
/* eslint-disable vars-on-top */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-use-before-define */
export function getTitle(user) {
  let title = user;
  if ((user.profile.name === 'undefined') || (user.profile.name === null)) {
    try {
      title = '@'.concat(user.email.substring(0, user.email.lastIndexOf('@')));
    } catch (e) {
      try {
        title = '@'.concat(user.username.replace('.id.blockstack', ''));
      } catch (e) {
        title = '@'.concat(user.zone_file.$origin.replace('.id.blockstack', ''));
      }
    }
  } else {
    title = user.profile.name;
  }
  return title;
}

export function getStatus(user) {
  return user.description === 'undefined'
    ? 'Hey there, I am using smalltalk'
    : user.description;
}

export function getAvatar(user) {
  // If user does not have image object
  if (user.profile.image === 'undefined') {
    return {
      hasImage: false,
      content: getAvatarName(user),
    };
  }
  // If profile has image
  return {
    hasImage: true,
    content: user.profile.image[0].contentUrl,
  };
}

export function getAvatarName(user) {
  if ((user.profile.name === 'undefined') || (user.profile.name === null)) {
    try {
      return user.email
        .toUpperCase()
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2);
    } catch (e) {
      try {
        return user.username
          .toUpperCase()
          .split(' ')
          .map((n) => n[0])
          .join('')
          .substring(0, 2);
      } catch (e) {
        return user.zone_file.$origin
          .toUpperCase()
          .split(' ')
          .map((n) => n[0])
          .join('')
          .substring(0, 2);
      }
    }
  }

  return user.profile.name
    .toUpperCase()
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2);
}

export function removeDuplicates(originalArray, prop) {
  const newArray = [];
  const lookupObject = {};

  for (var i in originalArray) {
    lookupObject[originalArray[i][prop]] = originalArray[i];
  }

  for (i in lookupObject) {
    newArray.push(lookupObject[i]);
  }
  return newArray;
}

export function isMobile() {
  if (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    )
  ) {
    return true;
  }
  return false;
}
