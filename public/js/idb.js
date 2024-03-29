let db;
const request = indexedDB.open("Budget_Tracker", 1);

request.onupgradeneeded = function (event) {
  const db = event.target.result;
  db.createObjectStore("new_transaction", { autoIncrement: true });
};

request.onsuccess = function (event) {
  db = event.target.result;

  if (navigator.onLine) {
    updateTransaction();
  }
};

request.onerror = function (event) {
  console.log(event.target.errorCode);
};

function saveRecord(record) {
  const transaction = db.transaction(["new_transaction"], "readwrite");

  const transactionObjectStore = transaction.objectStore("new_transaction");

  transactionObjectStore.add(record);
}

function updateTransaction() {
  //open transaction to database to read the stored data
  const transaction = db.transaction(["new_transaction"], "readwrite");

  const transactionObjectStore = transaction.objectStore("new_transaction");

  const getAll = transactionObjectStore.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction", {
        method: "POST",
        body: JSON.stringify(getAll.result),
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
          const transaction = db.transaction(["new_transaction"], "readwrite");
          const transactionObjectStore =
            transaction.objectStore("new_transaction");
          transactionObjectStore.clear();

          alert("Transactions submitted");
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
}

window.addEventListener("online", updateTransaction);
