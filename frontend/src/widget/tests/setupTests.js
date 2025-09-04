// Set up DOM environment for testing
window.HTMLCanvasElement.prototype.getContext = function () {
  return {
    fillRect: function() {},
    clearRect: function() {},
    getImageData: function(x, y, w, h) {
      return {
        data: new Array(w * h * 4)
      };
    },
    putImageData: function() {},
    createImageData: function() { return [] },
    setTransform: function() {},
    drawImage: function() {},
    save: function() {},
    fillText: function() {},
    restore: function() {},
    beginPath: function() {},
    moveTo: function() {},
    lineTo: function() {},
    closePath: function() {},
    stroke: function() {},
    translate: function() {},
    scale: function() {},
    rotate: function() {},
    arc: function() {},
    fill: function() {},
    measureText: function() {
      return { width: 0 };
    },
    transform: function() {},
    rect: function() {},
    clip: function() {},
  };
};

// Mock clipboard API
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve()),
  },
  configurable: true,
});

// Mock fetch
global.fetch = jest.fn();

// Mock QRCode
global.QRCode = jest.fn().mockImplementation((element, options) => {
  element.innerHTML = '<canvas></canvas>';
});

// Mock setInterval and clearInterval
global.setInterval = jest.fn();
global.clearInterval = jest.fn();

// Mock TextEncoder for QR code library
global.TextEncoder = class {
  encode(string) {
    return new Uint8Array(string.split('').map(char => char.charCodeAt(0)));
  }
};

// Mock TextDecoder for QR code library
global.TextDecoder = class {
  decode(buffer) {
    return String.fromCharCode.apply(null, new Uint8Array(buffer));
  }
};