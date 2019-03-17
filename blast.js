var w = window;

let big_container = document.getElementById("big_container");
let word_div = document.getElementById("word_div");
let word_text = document.getElementById("text_field");
let cloud_canvas = document.getElementById("cloud_canvas");

window.addEventListener("resize", resize_canvas);

function resize_canvas() {
    cloud_canvas.width = w.innerWidth;
    cloud_canvas.height = w.innerHeight;
    update_rocket_xy();
    word_div.style.left = (w.innerWidth - word_div.offsetWidth - 20) + "px";
    word_div.style.top =  (w.innerHeight - word_div.offsetHeight - 20) + "px";
}

big_container.style.width = (w.innerWidth * 0.99) + "px";
big_container.style.height = (w.innerHeight * 0.99) + "px";

word_div.style.position = "absolute";
let x = 5;

function countdown() {
    if (x > 0) {
	document.getElementById("text_field").innerHTML = "<h1>" + x + "</h1>";
	word_div.style.left = ((w.innerWidth * 0.99 / 2) - (word_div.offsetWidth / 2)) + "px";
	word_div.style.top = ((w.innerHeight * 0.99 / 2) - (word_div.offsetHeight / 2)) + "px";
	x--;
    }
    else {
	document.getElementById("text_field").innerHTML = '<h1>Blast Off</h1><br><button onclick="reset_launch()">Reset</button>';
	word_div.style.left = ((w.innerWidth * 0.99 / 2) - (word_div.offsetWidth / 2)) + "px";
	word_div.style.top = ((w.innerHeight * 0.99 / 2) - (word_div.offsetHeight / 2)) + "px";		
	clearInterval(t_interval);
	setup_move_word_text();
    }
}

function reset_launch() {
    document.getElementById("text_field").innerHTML = "";
    x = 5;
    t_interval = setInterval(countdown, 1000);
}

let t_interval = setInterval(countdown, 1000);

let final_x;
let final_y;
let x_incrimint;
let y_incrimint;
let x_current;
let y_current;
let frames_per_second = 60;
let time_total = 1 //In Seconds

function setup_move_word_text() {
    final_x = (w.innerWidth - word_div.offsetWidth) - 5;      // To left
    final_y = (w.innerHeight - word_div.offsetHeight);    // To top
    x_incrimint = (final_x - word_div.offsetLeft) / (frames_per_second * time_total);
    y_incrimint = (final_y - word_div.offsetTop) / (frames_per_second * time_total);
    x_current = word_div.offsetLeft;
    y_current = word_div.offsetTop;
    t_interval = setInterval(frame_interval, (1000 / frames_per_second));
}

function frame_interval() {
    x_current += x_incrimint;
    y_current += y_incrimint;
    if (x_current < final_x && y_current < final_y) {
	word_div.style.left = x_current + "px";
	word_div.style.top = y_current + "px";
//	console.log("x = " + x_incrimint + ", y = " + y_incrimint + " left = " + word_div.style.left + ", top = " + word_div.style.top);
    }
    else {
	clearInterval(t_interval);
	window.requestAnimationFrame(update_frame);
    }
}


// Lets try to mess around with some canvas stuff eh
// So lets set it up first

// Note:Nick - If you set a canvas without width / height properties they
// default to 300/150. Even if you set CSS properties later, canvas width/height
// remain 300/150. This messes up scaling x/y coords.... ALL BAD

// This is a hack, because I don't know any better

cloud_canvas.style.position = "absolute";
cloud_canvas.style.top = "0px";
cloud_canvas.style.left = "0px";
cloud_canvas.style.zIndex = "-1";
cloud_canvas.width = (w.innerWidth);
cloud_canvas.height = (w.innerHeight);

let rocket_img = new Image(270, 640);
rocket_img.src = "images/rocket.png";

let rocket_x = cloud_canvas.width / 2;
let rocket_y = cloud_canvas.height + (rocket_img.height / 2);
let rocket_move_y = true;
let rocket_scale = 1;
let rocket_rotation = 0;

console.log("R_Y = " + rocket_y);

let cloud_img = new Image();
cloud_img.src = "images/cloud-hi.png";

let cloud_array = new Array();

for(i = 0; i < 10; i++) {
    cloud_array.push(create_cloud());
}

function create_cloud() {
    let new_scale = Math.random() * 1;
    let rnd_x = Math.floor(Math.random() * ((cloud_img.width * new_scale) + w.innerWidth)) - (cloud_img.width * new_scale / 2);
    let rnd_y = Math.random() * cloud_canvas.height;
    let cloud = {
	scale : new_scale,
	x : rnd_x,
	y : -(cloud_img.height * new_scale),
	width : new_scale * cloud_img.width,
	height : new_scale * cloud_img.height,
	active: false,
	frames_to_start: Math.floor(Math.random() * 500)
    };

    if(Math.random() > 0.5) {
	if(rocket_rotation < 0) {
	    cloud.x = 0 - (cloud_img.width * new_scale);
	    cloud.y = rnd_y;
	}
	else if(rocket_rotation > 0) {
	    cloud.x = cloud_canvas.width;
	    cloud.y = rnd_y;
	}
    }
    
//    console.log("scale = " + cloud.scale + ", x = " + cloud.x + ", y = " + cloud.y + ", width = " + cloud.width + ", height = " + cloud.height);
    return cloud;
}

function update_frame() {
    for(i = 0; i < 10; i++){
	if(!cloud_array[i].active){
	    cloud_array[i].frames_to_start -= 1;
	    if(cloud_array[i].frames_to_start == 0) {
		cloud_array[i].active = true;
	    }
	}
    }
    
    let draw_area = cloud_canvas.getContext("2d");
    draw_area.clearRect(0, 0, w.innerWidth, w.innerHeight);

    for(i = 0; i < 10; i++) {
	if(cloud_array[i].active) {
	    if((cloud_array[i].y > cloud_canvas.height) ||
	       (cloud_array[i].x + cloud_array[i].width < 0) ||
	       (cloud_array[i] > cloud_array[i].x > cloud_canvas.width))
	    {
		cloud_array[i].active = false;
		cloud_array[i] = create_cloud();
		cloud_array.sort(function(a, b){return a.scale - b.scale});
	    }
	    else { // Do the move
		let x_y_factor = (cloud_array[i].scale * (rocket_rotation * 2 / 10));
		cloud_array[i].x += -x_y_factor;
		cloud_array[i].y += cloud_array[i].scale * 10 - Math.abs(x_y_factor);
		draw_area.drawImage(cloud_img, cloud_array[i].x, cloud_array[i].y, cloud_array[i].width, cloud_array[i].height);
	    }
	}
	if(i == 4) {
	    update_rocket(draw_area);
	}
    }

    window.requestAnimationFrame(update_frame);

}

function update_rocket(draw_area) {
    if(rocket_move_y) {
	rocket_y -= 2;
	rocket_x = cloud_canvas.width / 2;
	if (rocket_y  < (cloud_canvas.height / 1.5)){
	    rocket_move_y = false;
	}
    }
    else if(rocket_scale > 0.4) {
	rocket_scale -= 0.005;
	rocket_x = (cloud_canvas.width / 2);
    }

    draw_area.save();
    draw_area.translate(rocket_x, rocket_y);
    draw_area.rotate((Math.PI / 108) * rocket_rotation);
    
    draw_area.drawImage(rocket_img, -(rocket_img.width / 2 * rocket_scale), -(rocket_img.height / 2 * rocket_scale), rocket_img.width * rocket_scale, rocket_img.height * rocket_scale);

    draw_area.restore();
}

function update_rocket_xy() {
    rocket_x = cloud_canvas.width / 2;
    if (rocket_y  < (cloud_canvas.height / 1.5)) {
	rocket_y  = cloud_canvas.height / 1.5;
    }
}

// Now lets mess around with some keypress stuff and give somebody something to do
// Still don't have a clue what the heck I am doing

document.addEventListener("keydown", rotate_ship);

function rotate_ship(key_pressed){
//    console.log("Key code = " + key_pressed.code);
    if(key_pressed.code == 'KeyA' && rocket_rotation > -50) {
	rocket_rotation -= 1;
    }
    else if(key_pressed.code == 'KeyD' && rocket_rotation < 50) {
	rocket_rotation += 1;
    }
//    console.log("Rocket rotation = " + rocket_rotation);
}
