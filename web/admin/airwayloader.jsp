<html>
	<body>
	
		<%= skymonitor.airwayloader.Airways.processRequest(request) %>

		<form method='POST' enctype="multipart/form-data">
			Fichier airwaylegs : <input type='file' name='airwaylegs'><br>
			Fichier airways : <input type='file' name='airways'><br>
			Fichier waypoints : <input type='file' name='waypoints'><br>
			<input type='submit' value='Charger'>
		</form>
	
	</body>
</html>