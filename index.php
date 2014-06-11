<!DOCTYPE html>
<html lang=is>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    	<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
		<!-- Latest compiled and minified CSS -->
		<link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css">

		<!-- Optional theme -->
		<link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap-theme.min.css">

	    <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
	    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>

		<!-- Latest compiled and minified JavaScript -->
		<script src="//netdna.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min.js"></script>

		<!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
	    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
	    <!--[if lt IE 9]>
	      <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
	      <script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>
	    <![endif]-->

	    <script src="scripts/lib/dsp.js"></script>
	    <script type="text/javascript" src="scripts/NoteConverter.js"></script>
	    <script src="scripts/VoiceTrainer.js"></script>

	    <style type="text/css" title="currentStyle" media="screen">
			@import "css/extra.css";
		</style>

		<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/modernizr/2.8.2/modernizr.min.js"></script>

		<!--style type="text/css" title="BootstrapSliderStyle" media="screen">
			@import "Bootstrap-slider/css/slider.css";
		</style-->
		<link rel="stylesheet" href="Bootstrap-slider/slider.css" type="text/css">
		<script src="Bootstrap-slider/bootstrap-slider.js" type="text/javascript"></script>

	    <title>Söngþjálfi</title>
	</head>
	<body role="document">
		<nav class="navbar navbar-default navbar-static-top" role="navigation">
			<div class="container">
			    <div class="navbar-header">
			      <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#voice-trainer-navbar-collapse">
			        <span class="sr-only">Toggle navigation</span>
			        <span class="icon-bar"></span>
			        <span class="icon-bar"></span>
			        <span class="icon-bar"></span>
			      </button>
			      <a class="navbar-brand" href="#">Söngþjálfi</a>
			    </div>
			    <div class="collapse navbar-collapse" id="voice-trainer-navbar-collapse">
			    	<ul class="nav navbar-nav">
			    		<li class="active"><a href="#">Home</a></li>
			    		<li><a href="about">About</a></li>
			    	</ul>
			    </div>
			</div>
		</nav>
		<div class="container" role="main">
			<div class="container row">
				<div class="container col-lg-2"><button type="button" data-toggle="button" class="btn btn-primary btn-lg" id="Feedback">Toggle Feedback</button></div>
				<div class="container col-lg-3">
					<div class="panel panel-default">
						<div class="panel-heading">
							<h3 class="panel-title">Gain</h3>
						</div>
						<div class="panel-body">
							<input id="gain" data-slider-id='gain-slider' type="text" data-slider-min="-10" data-slider-max="10" data-slider-step="0.25" data-slider-value="0" data-slider-tooltip="hide"/>
						</div>
					</div>
				</div>
				<div class="container col-lg-3">
					<div class="panel panel-default">
						<div class="panel-heading">
							<h3 class="panel-title">FFT range</h3>
						</div>
						<div class="panel-body">
							<input id="fftSpan" data-slider-id="span-slider" type="text" class="span2" value="" data-slider-min="0" data-slider-step="1" data-slider-value="[1,100]"/>
						</div>
					</div>
				</div>
				<div class="container col-lg-2"><button type="button" data-toggle="button" class="btn btn-primary btn-lg" id="Oscillator">Toggle Mic./Osc.</button></div>
				<div class="container col-lg-2"><button type="button" data-toggle="button" class="btn btn-primary btn-lg" id="Render">Toggle Render</button></div>
			</div>
			<!--audio autoplay id="replay">Your browser does not support the audio tag.</audio-->
			<div class="well row" id="proto-output">
				<div class="container col-lg-4 col-md-12">
					<canvas id="render-pitch">Your browser does not support the canvas tag</canvas>
				</div>
				<div class="container col-lg-4 col-md-12">
					<canvas id="render-fft"></canvas>
				</div>
				<div class="container col-lg-4 col-md-12">
					<canvas id="render-waveform"></canvas>
				</div>
			</div>
		</div>
	</body>
</html>