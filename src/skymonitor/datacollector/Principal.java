package skymonitor.datacollector;

public class Principal {
	
	void main() {
		//Connection BD MDB à insérer ici
		ConnectionsDeconnectionsJS.connectionJS(); //Connection JS
		
		Repeteur.main();//Repeter le code contenu dans Executeur toutes les x secondes
		
		ConnectionsDeconnectionsJS.deconnectionJS(); //Deconnection JS
		//Deconnection BD MDB à insérer ici
	}
}
