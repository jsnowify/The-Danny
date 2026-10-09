export const grainVertex = `varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`;
export const grainFragment = `varying vec2 vUv;uniform sampler2D uPaper;uniform vec2 uResolution;
void main(){float n=texture2D(uPaper,vUv*uResolution/256.).r;float edge=smoothstep(.28,.83,distance(vUv,vec2(.5)));
gl_FragColor=vec4(vec3(.36,.32,.21),.035*(1.-n)+edge*.055);}`;
