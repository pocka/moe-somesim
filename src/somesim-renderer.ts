const vertexShader = `
  attribute vec2 aVertexPosition;

  varying highp vec2 vTextureCoord;

  void main() {
    gl_Position = vec4(aVertexPosition, 0, 1);

    vTextureCoord = aVertexPosition;
  }
`;

const fragmentShader = `
  precision mediump float;

  varying highp vec2 vTextureCoord;

  uniform vec3 uStain;
  uniform sampler2D uSampler;

  void main() {
    vec2 coord = (vTextureCoord + 1.0) / 2.0;

    vec4 tex = texture2D(uSampler, coord);

    vec3 blended = tex.xyz + (uStain * tex.w);

    gl_FragColor = vec4(blended, 1);
  }
`;

function colorAttributeToRGB(attr: string): number {
  const n = parseInt(attr, 16);
  if (isNaN(n)) {
    return 0;
  }

  return n;
}

/**
 * そめしむv5用単一画像と染める色を受け取り染色後の画像をレンダリングするコンポーネント
 */
export class SomesimRenderer extends HTMLElement {
  static get observedAttributes(): readonly string[] {
    return ["src", "color"];
  }

  attributeChangedCallback<K extends keyof SomesimRenderer>(
    name: K,
    _oldValue: SomesimRenderer[K],
    newValue: SomesimRenderer[K]
  ) {
    switch (name) {
      case "src": {
        this.#src = newValue as string;

        this.#loadImage().then(() => {
          this.#draw();
        });
        return;
      }
      case "color": {
        this.#color = colorAttributeToRGB(newValue as string);

        this.#applyColor();
        this.#draw();

        return;
      }
    }
  }

  connectedCallback() {
    this.#loadImage().then(() => {
      this.#draw();
    });
  }

  /**
   * 読み込む画像のURI
   */
  #src: string = this.getAttribute("src") || "";

  /**
   * RGB16進数表記をそのまま数値化したもの
   *
   * ビットシフトとビットマスクを組み合わせることでR/G/Bをそれぞれ取り出せる。
   */
  #color: number = colorAttributeToRGB(this.getAttribute("color") || "0");

  public set src(value: string) {
    this.#src = value;

    this.setAttribute("src", value);
  }

  public get src(): string {
    return this.#src;
  }

  public set color(value: number) {
    this.#color = this.color;
  }

  public get color(): number {
    return this.#color;
  }

  #canvas: HTMLCanvasElement = document.createElement("canvas");

  #gl: WebGL2RenderingContext | null = null;
  #shaderProgram: WebGLProgram | null = null;

  constructor() {
    super();

    const shadowRoot = this.attachShadow({ mode: "open" });

    const style = document.createElement("style");

    style.textContent = `
      :host {
        display: block;
      }
    `;

    shadowRoot.appendChild(style);

    shadowRoot.appendChild(this.#canvas);

    const gl = this.#canvas.getContext("webgl2", {
      antialias: false,
    });
    if (!gl) {
      console.warn("WebGLが利用できません");
      return;
    }

    const program = gl.createProgram()!;

    // 頂点シェーダーのコンパイルとリンク
    const vShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vShader, vertexShader);
    gl.compileShader(vShader);
    gl.attachShader(program, vShader);

    // フラグメントシェーダーのコンパイルとリンク
    const fShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fShader, fragmentShader);
    gl.compileShader(fShader);
    gl.attachShader(program, fShader);

    gl.linkProgram(program);
    gl.useProgram(program);

    // そのままだとDOM/JSから渡す画像が反転して表示されるのでピクセル順を逆に設定
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    const texture = gl.createTexture();

    if (!texture) {
      console.warn("テクスチャが生成できませんでした");
    }

    // このコンテキストではテクスチャオブジェクトは1つしか使わないので
    // 初期化時にまとめてパラメータ設定等してしまう
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // 描画する平面の座標データをバッファに格納
    const vertPosition = gl.getAttribLocation(program, "aVertexPosition");
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    gl.enableVertexAttribArray(vertPosition);
    gl.vertexAttribPointer(vertPosition, 2, gl.FLOAT, false, 0, 0);

    // 各メソッドから参照できるように記憶しておく
    this.#gl = gl;
    this.#shaderProgram = program;

    this.#applyColor();
    this.#loadImage().then(() => {
      this.#draw();
    });
  }

  /**
   * ビューポートに描画する
   */
  #draw() {
    if (!this.#gl) {
      return;
    }

    if (this.#canvas.width > 0 && this.#canvas.height > 0) {
      this.#gl.drawArrays(this.#gl.TRIANGLES, 0, 6);
    }
  }

  /**
   * 染色する色をシェーダーへのパラメータとして保存する
   */
  #applyColor(): void {
    if (!this.#gl || !this.#shaderProgram) {
      return;
    }

    const gl = this.#gl;
    const shaderProgram = this.#shaderProgram;

    const stainLoc = gl.getUniformLocation(shaderProgram, "uStain")!;

    const color = this.#color;
    const r = (color >> 16) & 0xff;
    const g = (color >> 8) & 0xff;
    const b = color & 0xff;

    gl.uniform3fv(stainLoc, [r / 255, g / 255, b / 255]);

    this.#draw();
  }

  /**
   * 画像をテクスチャとして読み込む
   */
  async #loadImage(): Promise<void> {
    if (!this.src) {
      this.#canvas.width = 0;
      this.#canvas.height = 0;
      return;
    }

    if (!this.#gl) {
      return;
    }

    const gl = this.#gl;

    const img = document.createElement("img");

    return new Promise((resolve, reject) => {
      img.onerror = () => {
        return reject(new Error("画像読み込みに失敗"));
      };

      img.onload = () => {
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          img.width,
          img.height,
          0,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          img
        );

        this.#canvas.width = img.width;
        this.#canvas.height = img.height;

        gl.viewport(0, 0, img.width, img.height);

        resolve();
      };

      img.src = this.src;
    });
  }
}
