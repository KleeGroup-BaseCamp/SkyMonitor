package skymonitor.datacollector;

public class Principal {
	
	void main() {
		//Connection BD MDB � ins�rer ici
		ConnectJS.connectionJS(); //Connection JS
		
		Repeteur.main();//Repeter le code contenu dans Executeur toutes les x secondes
		
		ConnectJS.deconnectionJS(); //Deconnection JS
		//Deconnection BD MDB � ins�rer ici
	}
}
