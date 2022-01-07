/**
 * Touch-to-move-forward controls for mobile.
 */
module.exports = AFRAME.registerComponent('mouse-touch-controls', {
  schema: {
    enabled: { default: true },
    reverseEnabled: { default: true },
  },

  init() {
    this.dVelocity = new THREE.Vector3();
    this.bindMethods();
    this.direction = 0;
    this.inProgress = false;
    this.prevPointerPosition = null;
  },

  play() {
    this.addEventListeners();
  },

  pause() {
    this.removeEventListeners();
    this.dVelocity.set(0, 0, 0);
  },

  remove() {
    this.pause();
  },

  addEventListeners() {
    const { sceneEl } = this.el;
    const canvasEl = sceneEl.canvas;

    if (!canvasEl) {
      sceneEl.addEventListener(
        'render-target-loaded',
        this.addEventListeners.bind(this)
      );
      return;
    }

    canvasEl.addEventListener('touchstart', this.onTouchStart);
    canvasEl.addEventListener('touchmove', this.onTouchMove);
    canvasEl.addEventListener('touchend', this.onTouchEnd);
    canvasEl.addEventListener('mousedown', this.onMouseDown);
    canvasEl.addEventListener('mousemove', this.onMouseMove);
    canvasEl.addEventListener('mouseup', this.onMouseUp);
  },

  removeEventListeners() {
    const canvasEl = this.el.sceneEl && this.el.sceneEl.canvas;
    if (!canvasEl) {
      return;
    }

    canvasEl.removeEventListener('touchstart', this.onTouchStart);
    canvasEl.removeEventListener('touchmove', this.onTouchMove);
    canvasEl.removeEventListener('touchend', this.onTouchEnd);
    canvasEl.removeEventListener('mousedown', this.onMouseDown);
    canvasEl.removeEventListener('mousemove', this.onMouseMove);
    canvasEl.removeEventListener('mouseup', this.onMouseUp);
  },

  isVelocityActive() {
    return this.data.enabled && !!this.direction;
  },

  getVelocityDelta() {
    this.dVelocity.z = this.direction / 3;
    return this.dVelocity.clone();
  },

  bindMethods() {
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
  },

  onTouchStart(e) {
    if (!e.touches || !e.touches.length) {
      e.preventDefault();
      return;
    }
    this.inProgress = true;
    const targetMovement = e.touches[0];
    this.prevPointerPosition = {
      x: targetMovement.clientX,
      y: targetMovement.clientY,
    };
    e.preventDefault();
  },

  onTouchMove(e) {
    if (!this.inProgress) {
      e.preventDefault();
      return;
    }
    if (!e.touches || !e.touches.length) {
      e.preventDefault();
      return;
    }
    const targetMovement = e.touches[0];
    const dY = targetMovement.clientY - this.prevPointerPosition.y;
    const dX = targetMovement.clientX - this.prevPointerPosition.x;
    if (!this.isVerticalMovement(dX, dY)) {
      e.preventDefault();
      return;
    }
    if (dY > 0) {
      this.direction = 1;
    }
    if (dY < 0) {
      this.direction = -1;
    }
    this.prevPointerPosition.x = targetMovement.clientX;
    this.prevPointerPosition.y = targetMovement.clientY;
    e.preventDefault();
  },

  onTouchEnd(e) {
    this.prevPointerPosition = null;
    this.inProgress = false;
    this.direction = 0;
    e.preventDefault();
  },

  onMouseDown(e) {
    this.inProgress = true;
    const targetMovement = e;
    this.prevPointerPosition = {
      x: targetMovement.clientX,
      y: targetMovement.clientY,
    };
    e.preventDefault();
  },
  onMouseMove(e) {
    if (!this.inProgress) {
      e.preventDefault();
      return;
    }
    const targetMovement = e;
    const dY = targetMovement.clientY - this.prevPointerPosition.y;
    const dX = targetMovement.clientX - this.prevPointerPosition.x;
    if (!this.isVerticalMovement(dX, dY)) {
      e.preventDefault();
      return;
    }
    if (dY > 0) {
      this.direction = 1;
    }
    if (dY < 0) {
      this.direction = -1;
    }
    this.prevPointerPosition.x = targetMovement.clientX;
    this.prevPointerPosition.y = targetMovement.clientY;
    e.preventDefault();
  },

  onMouseUp(e) {
    this.prevPointerPosition = null;
    this.inProgress = false;
    this.direction = 0;
    e.preventDefault();
  },

  isVerticalMovement(dX, dY) {
    return Math.abs(dY) > Math.abs(dX) && Math.abs(dY) > 3;
  },
});
