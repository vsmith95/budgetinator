// create db variable
let db;

const request = indexedDB.open("budgetTrackerIDB", 1);

request.onupgradeneeded = function (event) {
  // db reference
  const db = event.target.result;

  db.createObjectStore("tally", { autoIncrement: true });
};

// on success
request.onsuccess = function (event) {
  db = event.target.result;

  if (navigator.onLine) {
    uploadTally();
  }
};

// on error
request.onerror = function (event) {
  console.log(event.target.errorCode);
};

function saveData(data) {
  const transaction = db.transaction(["tally"], "readwrite");

  const tallyObjectStore = transaction.objectStore("tally");

  tallyObjectStore.add(data);
}

function uploadTally() {
  const transaction = db.transaction(["tally"], "readwrite");

  const tallyObjectStore = transaction.objectStore("tally");

  const getAll = tallyObjectStore.getAll();

  getAll.onsuccess = function () {
    // if data, send to server
    if (getAll.result.length > 0) {
      fetch("/api/transaction", {
        method: "POST",
        body: JSON.stringify(getAlly.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((serverResponse) => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }

          const transaction = db.transaction(["tally"], "readwrite");

          const tallyObjectStore = transaction.objectStore("tally");

          tallyObjectStore.clear();

          alert("All offline transactions are officially updated");
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
}

// event listener for coming online
window.addEventListener("online", uploadTally);