/**
 * set up indexedDB
 */
let dbPromise = idb.open('rr-db', 1, function(upgradeDb) {
  switch (upgradeDb.oldVersion) {
    case 0:
    // placeholder so that switchblock will execute when db is first created
    case 1:
    upgradeDb.createObjectStore('restaurants', {keyPath: 'id'});
  }
})

/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

    /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    // get restaurants from indexedDB
    // dbPromise.then(function (db) {
    //   let tx = db.transaction('restaurants');
    //   let restaurantStore = tx.objectStore('restaurants');
    //   return restaurantStore.getAll();
    // })
    //   .then(function (restaurants) {
    //     if (restaurants.length !== 0) {
    //       callback(null, restaurants);
    //     } else {
      
          // fetch from network
          fetch(DBHelper.DATABASE_URL)
            .then(function (res) {
              return res.json();
            })
            .then(function (restaurants) {
              // add to indexedDB
              dbPromise.then(function (db) {
                let tx = db.transaction('restaurants', 'readwrite');
                let restaurantStore = tx.objectStore('restaurants');
                restaurants.forEach(function (restaurant) {
                  restaurantStore.put(restaurant);
                })
                callback(null, restaurants);
              })
            })
            .catch(function (error) {
              callback(null, error);
            })
        }
  //     })
  // }

  static updateIndexDB()  {
    fetch(DBHelper.DATABASE_URL)
            .then(function (res) {
              return res.json();
            })
            .then(function (restaurants) {
              // add to indexedDB
              dbPromise.then(function (db) {
                let tx = db.transaction('restaurants', 'readwrite');
                let restaurantStore = tx.objectStore('restaurants');
                restaurants.forEach(function (restaurant) {
                  restaurantStore.put(restaurant);
                })
            //     callback(null, restaurants);
            //   })
            })
            // .catch(function (error) {
            //   callback(null, error);
            })
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker  
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      })
      marker.addTo(newMap);
    return marker;
  }  
}
