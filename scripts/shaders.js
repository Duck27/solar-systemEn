export const starVertexShader = `
  uniform float uSize;
  attribute float phase;
  varying float vPhase;

  void main() {
    vPhase = phase;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uSize * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const starFragmentShader = `
  precision mediump float;
  uniform float uTime;
  uniform sampler2D uTexture;
  varying float vPhase;

  void main() {
    float blink = 0.6 + 0.4 * sin(uTime * 2.0 + vPhase);
    vec4 texColor = texture2D(uTexture, gl_PointCoord);
    gl_FragColor = vec4(texColor.rgb * 2.0, texColor.a * blink);
  }
`;
