/**
 * Touch-to-move-forward controls for mobile.
 */
module.exports = AFRAME.registerComponent('touch-controls', {
  schema: {
    enabled: { default: true },
    reverseEnabled: { default: true }
  },

  init: function () {
    this.dVelocity = new THREE.Vector3();
    this.bindMethods();
  },

  play: function () {
    this.addEventListeners();
  },

  pause: function () {
    this.removeEventListeners();
    this.dVelocity.set(0, 0, 0);
  },

  remove: function () {
    this.pause();
  },

  addEventListeners: function () {
    const sceneEl = this.el.sceneEl;
    const canvasEl = sceneEl.canvas;

    if (!canvasEl) {
      sceneEl.addEventListener('render-target-loaded', this.addEventListeners.bind(this));
      return;
    }

    canvasEl.addEventListener('touchstart', this.onTouchStart);
    canvasEl.addEventListener('touchend', this.onTouchEnd);
  },

  removeEventListeners: function () {
    const canvasEl = this.el.sceneEl && this.el.sceneEl.canvas;
    if (!canvasEl) { return; }

    canvasEl.removeEventListener('touchstart', this.onTouchStart);
    canvasEl.removeEventListener('touchend', this.onTouchEnd);
  },

  isVelocityActive: function () {
    return this.data.enabled && this.isMoving;
  },

  getVelocityDelta: function () {
    const zDir = this.isReverse && this.data.reverseEnabled ? 1 : -1
    this.dVelocity.z = this.isMoving ? zDir : 0;
    return this.dVelocity.clone();
  },

  bindMethods: function () {
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
  },

  onTouchStart: function (e) {
    this.isMoving  = true;
    this.isReverse = e.touches.length == 2
    e.preventDefault();
  },

  onTouchEnd: function (e) {
    this.isMoving = false;
    e.preventDefault();
  }
});
