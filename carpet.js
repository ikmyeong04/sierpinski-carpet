var gl;
var points = [];
var numSub = 3;
var myColor = vec4(0.0, 1.0, 0.0, 1.0);

var vBuffer;
var colorLoc;

window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL 로드 실패");
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    colorLoc = gl.getUniformLocation(program, "uColor");

    // 슬라이더 조작
    document.getElementById("slider").oninput = function(e) {
        numSub = parseInt(e.target.value);
        document.getElementById("depthText").innerText = numSub;
        drawCarpet();
    };

    // 색상 변경
    document.getElementById("color").oninput = function(e) {
        var hex = e.target.value;
        var r = parseInt(hex.substring(1, 3), 16) / 255.0;
        var g = parseInt(hex.substring(3, 5), 16) / 255.0;
        var b = parseInt(hex.substring(5, 7), 16) / 255.0;
        
        myColor = vec4(r, g, b, 1.0);
        render();
    };

    drawCarpet();
};

// 사각형 정점 푸시
function makeSquare(a, b, c, d) {
    points.push(a);
    points.push(b);
    points.push(c);

    points.push(a);
    points.push(c);
    points.push(d);
}

// 3x3 쪼개기 재귀함수
function divideSquare(a, b, c, d, count) {
    if (count == 0) {
        makeSquare(a, b, c, d);
    } else {
        // 1/3, 2/3 지점 구하기
        var ab1 = mix(a, b, 1/3);
        var ab2 = mix(a, b, 2/3);
        var dc1 = mix(d, c, 1/3);
        var dc2 = mix(d, c, 2/3);

        var p00 = a;
        var p01 = ab1;
        var p02 = ab2;
        var p03 = b;

        var p30 = d;
        var p31 = dc1;
        var p32 = dc2;
        var p33 = c;

        var p10 = mix(p00, p30, 1/3);
        var p11 = mix(p01, p31, 1/3);
        var p12 = mix(p02, p32, 1/3);
        var p13 = mix(p03, p33, 1/3);

        var p20 = mix(p00, p30, 2/3);
        var p21 = mix(p01, p31, 2/3);
        var p22 = mix(p02, p32, 2/3);
        var p23 = mix(p03, p33, 2/3);

        // 가운데 영역 제외하고 8개 호출
        divideSquare(p00, p01, p11, p10, count - 1);
        divideSquare(p01, p02, p12, p11, count - 1);
        divideSquare(p02, p03, p13, p12, count - 1);

        divideSquare(p10, p11, p21, p20, count - 1);
        divideSquare(p12, p13, p23, p22, count - 1);

        divideSquare(p20, p21, p31, p30, count - 1);
        divideSquare(p21, p22, p32, p31, count - 1);
        divideSquare(p22, p23, p33, p32, count - 1);
    }
}

function drawCarpet() {
    points = [];

    var p1 = vec2(-1.0, -1.0);
    var p2 = vec2(-1.0, 1.0);
    var p3 = vec2(1.0, 1.0);
    var p4 = vec2(1.0, -1.0);

    divideSquare(p1, p2, p3, p4, numSub);

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    render();
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform4fv(colorLoc, flatten(myColor));
    gl.drawArrays(gl.TRIANGLES, 0, points.length);
}