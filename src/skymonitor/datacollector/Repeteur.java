package skymonitor.datacollector;

import java.util.Timer;
import java.util.TimerTask;

public class Repeteur {
	public static void main() {
		TimerTask task = new TimerTask() {
			@Override
			public void run() {
				ConnectJS.connectionJS();
				Executeur exec = new Executeur();
				exec.main();
			}	
		};
		
		Timer timer = new Timer();
		timer.scheduleAtFixedRate(task, 0, 5000);
	}
}

/* Pour info, voici le fichier d'exemple, qui fonctionne, et sur lequel je me suis basé :

package getData;

import java.util.Timer;
import java.util.TimerTask;

public class Repeteur
	{
		public static void main(String...args)
		{
			TimerTask task = new TimerTask()
			{
				@Override
				public void run() 
				{
					System.out.println("Hello World !");
				}	
			};
			
			Timer timer = new Timer();
			timer.scheduleAtFixedRate(task, 0, 1000);
		}
	}
	
*/

