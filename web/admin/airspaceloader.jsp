<html>
<body>

<%= skymonitor.airspaceloader.LectureFichier.processRequest(request) %>

<form method='POST' enctype="multipart/form-data">
Fichier : <input type='file' name='airspace' />
<input type='submit' value='Charger'/>
</form>

</body>
</html>