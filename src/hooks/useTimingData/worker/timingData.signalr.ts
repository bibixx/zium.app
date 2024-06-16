/* eslint-disable no-var */

class SignalRLoader {
  public promise: Promise<void>;

  constructor() {
    this.promise = this.load();
  }

  private load = async () => {
    var document = (self.document = {
      parentNode: null,
      nodeType: 9,
      toString: function () {
        return "FakeDocument";
      },
    });
    var window = (self.window = self);
    var fakeElement = Object.create(document);
    fakeElement.nodeType = 1;
    fakeElement.toString = function () {
      return "FakeElement";
    };
    fakeElement.parentNode = fakeElement.firstChild = fakeElement.lastChild = fakeElement;
    fakeElement.ownerDocument = document;
    fakeElement.attributes = { onsubmit: {}, onchange: {}, onfocusin: {} };
    fakeElement.style = {};

    document.head = document.body = fakeElement;
    document.ownerDocument = document.documentElement = document;
    document.getElementById = document.createElement = function () {
      return fakeElement;
    };
    document.createDocumentFragment = function () {
      return this;
    };
    document.getElementsByTagName = document.getElementsByClassName = function () {
      return [fakeElement];
    };
    document.getAttribute =
      document.setAttribute =
      document.removeChild =
      document.addEventListener =
      document.removeEventListener =
        function () {
          return null;
        };
    document.cloneNode = document.appendChild = function () {
      return this;
    };
    document.appendChild = function (child) {
      return child;
    };

    window.$ = window.jQuery = (await import("jquery")).default;
    await import("signalr");
  };
}

export const signalRLoader = new SignalRLoader();
