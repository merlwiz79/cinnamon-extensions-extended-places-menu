## cinnamon-extensions-extended-places-menu

cinnamon-extensions-extended-places-menu was ported from [gnome-shell-extensions-extended-places-menu](http://gnome-look.org/content/show.php/?content=146113) to work in [Cinnamon](http://cinnamon.linuxmint.com/).


### Installation

* [Ubuntu](https://launchpad.net/~merlwiz79/+archive/cinnamon-ppa)
* Generic: For a generic installation, run the following commands:
  `./autogen.sh --prefix=/usr && make && sudo make install`
  * Make sure you have the `libglib2.0-dev` package (or equivalent for your distribution)
    installed, or else you'll get an error about `GLIB_GSETTINGS`.
* *Please report further links!*

That's it!

----

### Filezilla with Folders

How to import sites from Filezilla "SITE MANAGER" when I am using sub-folders in "SITE MANAGER" ?

Examplelook of "SITE MANAGER":

My Sites:
  - server1
  - server2
  - NewFolder
      - server3
      - NewFolder2
         -server4


1.) In Preferences set as client Filezilla
2.) click update FTP list
3.) click "SAVE" and close preferences
4.) open terminal
5.) run command: gsettings get org.cinnamon.extensions.extended.places-menu ftp-list
    you will get this output: ['server1', 'server2', 'server3', 'server4']

6.) to fix it run the following command:
    
     gsettings set org.gnome.shell.extensions.places-menu-extended ftp-list "['server1', 'server2', 'NewFolder/server3', 'NewFolder/NewFolder2/server4']"

7.) remember if you click on "Update FTP" button in preferences, this list will be overwrited again (so is better to have sites in root folder on "SITE MANAGER"
8.) ALT+F2 type r and enter


#### Restart Cinnamon

Don't forget to logut of Cinnamon

----

### Original Author

Peter Kmet (petrakis)


### License

cinnamon-extensions-extended-places-menu is free software: you can redistribute it and/or modify it under the terms of the **GNU General Public License as published by the Free Software Foundation, either version 3** of the License, or (at your option) any later version.

cinnamon-extensions-extended-places-menu is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with cinnamon-extensions-extended-places-menu.  If not, see <http://www.gnu.org/licenses/>.

