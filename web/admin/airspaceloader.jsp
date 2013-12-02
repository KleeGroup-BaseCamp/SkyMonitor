<html>
	<body>
	
		<%= skymonitor.airspaceloader.LectureFichier.processRequest(request) %>

		<form method='POST' enctype="multipart/form-data">
			<select name='pays'>
				<option value=null>Choisir un pays...</option>
				<option value="Fr">France</option>
				<option value="UK">Royaume-Uni</option>
				<option value="US">USA</option>
				<option value="Be">Belgique</option>
			</select>
			Fichier : <input type='file' name='airspace'>
			<input type='submit' value='Charger'>
		</form>
	
	</body>
</html>