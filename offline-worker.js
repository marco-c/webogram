/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */


(function (self) {
  'use strict';

  // On install, cache resources and skip waiting so the worker won't
  // wait for clients to be closed before becoming active.
  self.addEventListener('install', function (event) {
    event.waitUntil(oghliner.cacheResources().then(function () {
      return self.skipWaiting();
    }));
  });

  // On activation, delete old caches and start controlling the clients
  // without waiting for them to reload.
  self.addEventListener('activate', function (event) {
    event.waitUntil(oghliner.clearOtherCaches().then(function () {
      return self.clients.claim();
    }));
  });

  // Retrieves the request following oghliner strategy.
  self.addEventListener('fetch', function (event) {
    if (event.request.method === 'GET') {
      event.respondWith(oghliner.get(event.request));
    } else {
      event.respondWith(self.fetch(event.request));
    }
  });

  var oghliner = self.oghliner = {

    // This is the unique prefix for all the caches controlled by this worker.
    CACHE_PREFIX: 'offline-cache:marco-c/webogram:' + (self.registration ? self.registration.scope : '') + ':',

    // This is the unique name for the cache controlled by this version of the worker.
    get CACHE_NAME() {
      return this.CACHE_PREFIX + 'edb15aeb3cca4763440ac4c6c9c85418d27a8b6b';
    },

    // This is a list of resources that will be cached.
    RESOURCES: [
      './', // cache always the current root to make the default page available
      './favicon.ico', // 3306fba7846b0fedbd75ee0c602b3d5b8f9703d5
      './favicon_unread.ico', // 66885a3da6f24827e0b19e4106adb3b93397e984
      './css/app.css', // ded32d91d146873ea5ad55b066d2b32a551f6bba
      './css/desktop.css', // cc6efa62434a727efeb82060927e0fe621cd3451
      './css/mobile.css', // e65191235b503f4fe31814f9ff54a91861204582
      './img/Manytabs.png', // 57e167ea58454996542bb1cf82f4de85e006d58f
      './img/Manytabs_2x.png', // 976690a331bbeee4122ebcf2afc602422ebb6100
      './img/Telegram.png', // 41b7d21631f3f1176d1cf83cdbd351150f8b7c91
      './img/Telegram72.png', // 6b2c4f5f65cda37c01e600e30c2b48be36ef27f1
      './img/Telegram72_2x.png', // 3f93d610ce69a08a978d678d2c3ae243ebe79926
      './img/Telegram_2x.png', // bf9998edcf7a9477d8e51646859253cc1d5dceb9
      './img/blank.gif', // a1fdee122b95748d81cee426d717c05b5174fe96
      './img/emojisprite_0.png', // 2d116ffb1e0434b6b74cbcc6da7b289b3a714911
      './img/emojisprite_1.png', // b9702deb2be7c856f8523f4cc78190998fe65cee
      './img/emojisprite_2.png', // d493054c1369d5172e92fdecbc6dd3c85d5236bf
      './img/emojisprite_3.png', // e3425914bdf1f6fab6d96f5484036eb7d0d700e4
      './img/emojisprite_4.png', // 4351e4790ea794a4e0fa353c83bdd5a8feedfa4b
      './img/iphone_home120.png', // 312049590bc4bc278c344b9b08fab4ecafb958dd
      './img/iphone_startup.png', // ece74bef048e018bdedf0cdf2e84a1e63f38dbe1
      './img/logo_share.png', // 005d05f75035199ce090e647697723a98ed1e6a7
      './img/sound_a.mp3', // 95e6e0f7648e28ea21bc434054ea59aba3a35aea
      './js/app.js', // 2b8c8622f2c92b23c0affd118ff8b7e83351449d
      './nacl/mtproto_crypto.nmf', // 28b70b2956745d0c85647ab649fb56ccbeb23b32
      './nacl/mtproto_crypto.pexe', // 46fb8b5c09d691a3e8143388eea99e984e56b789
      './img/changelog/card_wecandoit.png', // 78adb89b83a42a6a9e26a5475a5c720645b3cb59
      './img/icons/AboutLogos.png', // b96a6ca66685974f0d10d163bf0163294bb5e654
      './img/icons/AboutLogos_2x.png', // 4e34061b76f24b7a6bafcc5267af5e1447357a29
      './img/icons/General.png', // b7f06e2aec4146ec4422e7ce5bb040db58f20f66
      './img/icons/General_2x.png', // ad891edded5fefebeafb92f51f370c732d1304b1
      './img/icons/IconsetSmiles.png', // 6602a890aae0e1b9a83e29ffec208357cab0eeab
      './img/icons/IconsetSmiles_2x.png', // 7bb604a03b3b8a55d41d0d4b2432479c03e31290
      './img/icons/IconsetW.png', // 87b231a531f3c1d2e4bd48d8bcc0a263befe62f7
      './img/icons/IconsetW_2x.png', // 0bbc33afc0a117449ae96bd8c15f4f636d654f5f
      './img/icons/Major.png', // a6cfe341db4831b7ad59348b1d7431a80dfed77e
      './img/icons/Major_2x.png', // b9d9ab58bb1d40d29a537813796497b58adb79bb
      './img/icons/MobileIcons.png', // 44621ff41dd6fe0d3efb3e6d34af1b5879c726df
      './img/icons/MobileIcons_2x.png', // 94fbc985a7785aadd744ab581286a2848cb31edd
      './img/icons/PhotoIcons.png', // 3150febb4b6f21ffeb7ef97b4041521ec0fc4a31
      './img/icons/PhotoIcons_2x.png', // 4c9467de09347308e32b61432989c2285cde839c
      './img/icons/ProfileIcons.png', // b797a2b4f0bd6d8960548b4afc61ab324a42fe03
      './img/icons/ProfileIcons_2x.png', // 4d3b4f76dd9266501ad04a4c1bbbbef2fed9b6d4
      './img/placeholders/DialogListAvatarSystem@2x.png', // bb1a70e4a58000df5d20b2ad55a487abddd97147
      './img/placeholders/GroupAvatar1@2x.png', // 15e639083b81292581002328c8110761f969f6c6
      './img/placeholders/GroupAvatar2@2x.png', // 8cfe4ae3397c9e5c9aa3e8e066e0f45cc34237f3
      './img/placeholders/GroupAvatar3@2x.png', // 566f539a62b9a3d7d4f4cf38d7b27c73f31cb9fe
      './img/placeholders/GroupAvatar4@2x.png', // 5ede7a10c2fe1108df50fbec95c09dca7538063f
      './img/placeholders/PhotoThumbConversation.gif', // a1fdee122b95748d81cee426d717c05b5174fe96
      './img/placeholders/PhotoThumbModal.gif', // a1fdee122b95748d81cee426d717c05b5174fe96
      './img/placeholders/UserAvatar1@2x.png', // ab6ae45202b4209330945fe1d466ec9956641738
      './img/placeholders/UserAvatar2@2x.png', // 1e359cf3e5eeee34167892f988792886bce123a3
      './img/placeholders/UserAvatar3@2x.png', // 8e32ca5c4b7691b4873e9e6f29192f13d5cb9e84
      './img/placeholders/UserAvatar4@2x.png', // cb732b1da6f1285444d5ca852ce3eb7079dc4a97
      './img/placeholders/UserAvatar5@2x.png', // eb7d074af9c9e0641d0ffbcd7de2d837c522b11d
      './img/placeholders/UserAvatar6@2x.png', // 0bb46015d619a63bf0ee1a5e1c0cede24417b5d1
      './img/placeholders/UserAvatar7@2x.png', // d77d8f7b1ac20177b5bcb77b18a30f00b207020e
      './img/placeholders/UserAvatar8@2x.png', // 7e6a7cb327af18a15a8b2a1b00565d25bd38c8f7
      './img/placeholders/VideoThumbConversation.gif', // a1fdee122b95748d81cee426d717c05b5174fe96
      './img/placeholders/VideoThumbModal.gif', // a1fdee122b95748d81cee426d717c05b5174fe96
      './js/lib/bin_utils.js', // 8c020668558a7f315c86052655a25b7128432093
      './js/lib/crypto_worker.js', // dc69861b74cb8a58d40277865b1ac0e215612251
      './js/lib/polyfill.js', // 24fc1e8058c547fb11e0f9771a7729fb23936d0b
      './js/locales/de-de.json', // 3d354d8fda5ad4511249969adde5019e7a2405c8
      './js/locales/en-us.json', // 609c8ee52d39cdbbb55360afe8fd7e3b24dbc4d4
      './js/locales/es-es.json', // 23c104e5860f027281945333a42125ea2c2b69af
      './js/locales/it-it.json', // ccfc96142c227ca01171800caa3e11cbd2b811a2
      './js/locales/nl-nl.json', // 74b99cdc9117bbe508427867e02cf1432b212312
      './js/locales/pt-br.json', // ae00be6e4b24fbfa5f1ba3843e827fc9706ed7cc
      './js/locales/ru-ru.json', // c70aa177991220a9b2ff6951ef289ca6e382d094
      './vendor/closure/long.js', // 5405ea3612003c91e32f721d664953a3c59d617d
      './vendor/cryptoJS/crypto.js', // d19746a7093963f02edce52c35b2fa348f581e7c
      './vendor/jsbn/jsbn_combined.js', // 5f6537a517860b4c57fbd2d0de201b5ba80bec2b
      './vendor/leemon_bigint/bigint.js', // 2382de9bdf5bdf705531b41a88de8f2868959b20
      './vendor/rusha/rusha.js', // 374808b2f6828c82f6b33e2acc4091ea23e31a15
      './vendor/angular/i18n/angular-locale_de-de.js', // a7496e022e41f6247bad5609625e8404b9654c4c
      './vendor/angular/i18n/angular-locale_en-us.js', // b425d63be9df5e2746ae9e091a049e0c18d451fe
      './vendor/angular/i18n/angular-locale_es-es.js', // e983874f8cc681ef3c14f4edef28e431a891ba12
      './vendor/angular/i18n/angular-locale_it-it.js', // 65660acbb9863252f4a4e3209128ec6efe3c8b19
      './vendor/angular/i18n/angular-locale_nl-nl.js', // b32a0ee4b037ecf94ebffd38bb5efcca79ad03ba
      './vendor/angular/i18n/angular-locale_pt-br.js', // df350fa803da77cb0c8d35bbf38aef1904795917
      './vendor/angular/i18n/angular-locale_ru-ru.js', // 91193637e437b5ea3c6c65eba6ae77c6fa48d324

    ],

    // Adds the resources to the cache controlled by this worker.
    cacheResources: function () {
      var now = Date.now();
      var baseUrl = self.location;
      return this.prepareCache()
      .then(function (cache) {
        return Promise.all(this.RESOURCES.map(function (resource) {
          // Bust the request to get a fresh response
          var url = new URL(resource, baseUrl);
          var bustParameter = (url.search ? '&' : '') + '__bust=' + now;
          var bustedUrl = new URL(url.toString());
          bustedUrl.search += bustParameter;

          // But cache the response for the original request
          var requestConfig = { credentials: 'same-origin' };
          var originalRequest = new Request(url.toString(), requestConfig);
          var bustedRequest = new Request(bustedUrl.toString(), requestConfig);
          return fetch(bustedRequest).then(function (response) {
            if (response.ok) {
              return cache.put(originalRequest, response);
            }
            console.error('Error fetching ' + url + ', status was ' + response.status);
          });
        }));
      }.bind(this));
    },

    // Remove the offline caches not controlled by this worker.
    clearOtherCaches: function () {
      var deleteIfNotCurrent = function (cacheName) {
        if (cacheName.indexOf(this.CACHE_PREFIX) !== 0 || cacheName === this.CACHE_NAME) {
          return Promise.resolve();
        }
        return self.caches.delete(cacheName);
      }.bind(self);

      return self.caches.keys()
      .then(function (cacheNames) {
        return Promise.all(cacheNames.map(deleteIfNotCurrent));
      });

    },

    // Get a response from the current offline cache or from the network.
    get: function (request) {
      return this.openCache()
      .then(function (cache) {
        return cache.match(request);
      })
      .then(function (response) {
        if (response) {
          return response;
        }
        return self.fetch(request);
      });
    },

    // Prepare the cache for installation, deleting it before if it already exists.
    prepareCache: function () {
      return self.caches.delete(this.CACHE_NAME).then(this.openCache.bind(this));
    },

    // Open and cache the offline cache promise to improve the performance when
    // serving from the offline-cache.
    openCache: function () {
      if (!this._cache) {
        this._cache = self.caches.open(this.CACHE_NAME);
      }
      return this._cache;
    }

  };
}(self));
