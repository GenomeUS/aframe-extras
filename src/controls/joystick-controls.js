/**
 * Gamepad controls for A-Frame.
 *
 * Stripped-down version of: https://github.com/donmccurdy/aframe-gamepad-controls
 *
 * For more information about the Gamepad API, see:
 * https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API/Using_the_Gamepad_API
 */

const JOYSTICK_EPS = 10;

module.exports = AFRAME.registerComponent('joystick-controls', {

  /*******************************************************************
   * Schema
   */

  schema: {
    // Enable/disable gamepad-controls
    enabled: { default: true },

    // Heading element for rotation
    camera: { default: '[camera]', type: 'selector' },

    // Rotation sensitivity
    rotationSensitivity: { default: 0.01 },

    // Joystick variable
    joystick: { default: 'joystick' },
  },

  /*******************************************************************
   * Core
   */

  /**
   * Called once when component is attached. Generally for initial setup.
   */
  init: function () {
    const sceneEl = this.el.sceneEl;

    this.prevTime = window.performance.now();

    // Button state
    this.buttons = {};

    // Rotation
    const rotation = this.el.object3D.rotation;
    this.pitch = new THREE.Object3D();
    this.pitch.rotation.x = THREE.Math.degToRad(rotation.x);
    this.yaw = new THREE.Object3D();
    this.yaw.position.y = 10;
    this.yaw.rotation.y = THREE.Math.degToRad(rotation.y);
    this.yaw.add(this.pitch);

    this._lookVector = new THREE.Vector2();
    this._moveVector = new THREE.Vector2();
    this._dpadVector = new THREE.Vector2();

    sceneEl.addBehavior(this);
  },

  /**
   * Called when component is attached and when component data changes.
   * Generally modifies the entity based on the data.
   */
  update: function () { this.tick(); },

  /**
   * Called on each iteration of main render loop.
   */
  tick: function (t, dt) {
    this.updateRotation(dt);
  },

  /**
   * Called when a component is removed (e.g., via removeAttribute).
   * Generally undoes all modifications to the entity.
   */
  remove: function () { },

  /*******************************************************************
   * Movement
   */

  getJoystickData: function () {
    return window[this.data.joystick] || {x: 0, y: 0};
  },

  isVelocityActive: function () {
    if (!this.data.enabled) return false;

    const joystickData = this.getJoystickData();
    const inputY = joystickData.y;

    return Math.abs(inputY) > JOYSTICK_EPS;
  },

  getVelocityDelta: function () {
    const joystickData = this.getJoystickData();
    const inputY = joystickData.y;

    const dVelocity = new THREE.Vector3();

    if (Math.abs(inputY) > JOYSTICK_EPS) {
      dVelocity.z += inputY / 66;
    }

    return dVelocity;
  },

  /*******************************************************************
   * Rotation
   */

  isRotationActive: function () {
    if (!this.data.enabled) return false;


    const joystickData = this.getJoystickData();
    const inputX = joystickData.x;

    return Math.abs(inputX) > JOYSTICK_EPS * 2;
  },

  updateRotation: function (dt) {
    if (!this.isRotationActive()) return;

    const data = this.data;
    const yaw = this.yaw;
    const camera = document.querySelector("#camera");
    const lookControls = camera.components['look-controls-horizontal'];
    const hasLookControls = lookControls && lookControls.pitchObject && lookControls.yawObject;

    // Sync with look-controls pitch/yaw if available.
    if (hasLookControls) {
      yaw.rotation.copy(lookControls.yawObject.rotation);
    }

    const lookVector = this._lookVector;

    const joystickData = this.getJoystickData();
    const inputX = joystickData.x;

    lookVector.set(inputX, 0);

    if (Math.abs(lookVector.y) <= JOYSTICK_EPS) lookVector.y = 0;

    lookVector.multiplyScalar(data.rotationSensitivity * dt / 1000);
    yaw.rotation.y -= lookVector.x;
    camera.object3D.rotation.set(0, yaw.rotation.y, 0);

    // Sync with look-controls pitch/yaw if available.
    if (hasLookControls) {
      lookControls.yawObject.rotation.copy(yaw.rotation);
    }
  },



});
