export const SaturationContrastShader = {

    uniforms: {
        "tDiffuse": { value: null },
        "saturation": { value: 1.0 },
        "contrast": { value: 1.0 }
    },

    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,

    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float saturation;
        uniform float contrast;
        varying vec2 vUv;

        vec3 applySaturation(vec3 color, float sat) {
            float l = dot(color, vec3(0.2126, 0.7152, 0.0722));
            return mix(vec3(l), color, sat);
        }

        vec3 applyContrast(vec3 color, float contrast) {
            return (color - 0.5) * contrast + 0.5;
        }

        void main() {
            vec4 texel = texture2D(tDiffuse, vUv);
            vec3 color = texel.rgb;

            color = applySaturation(color, saturation);
            color = applyContrast(color, contrast);

            gl_FragColor = vec4(color, texel.a);
        }
    `
};