
(function (window) {
    window.__env = window.__env || {};
  
    window.__env["loginApiStatus"] = {
        unAuthorize: "Unauthorized", 
        wrongEmail: "wrongEmail"
    };

    window.__env["status"] = {
        ACTIVE: "active",
        INACTIVE: "inactive",
        FLAGGED: "flagged",
        DELETED: "deleted",
        EXPIRED: "expired",
        LIVE: "live"
    };

    window.__env["expirationDays"] = 7;
  
  }(this));