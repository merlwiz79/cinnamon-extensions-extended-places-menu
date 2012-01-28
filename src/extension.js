/* -*- mode: js2; js2-basic-offset: 4; indent-tabs-mode: nil -*- */

const Gdk = imports.gi.Gdk;
const GLib = imports.gi.GLib;
const Lang = imports.lang;
const Cinnamon = imports.gi.Cinnamon;
const St = imports.gi.St;

const PlaceDisplay = imports.ui.placeDisplay;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Panel = imports.ui.panel;

const Gettext = imports.gettext.domain('cinnamon-extensions-extended-places-menu');
const _ = Gettext.gettext;

const PLACE_ICON_SIZE = 22;

const EPM_SETTINGS_SCHEMA = 'org.cinnamon.extensions.extended-places-menu';
const EPM_FTP_KEY = 'ftpclient';
const EPM_FSOPEN_KEY = 'filesystemopen';
const EPM_VBOX_KEY = 'virtualbox';
const EPM_CBOX_KEY = 'show-computer';
const EPM_BOOKMARKS_KEY = 'bookmarksstate';
const EPM_ACTIONS_KEY = 'actions';
const EPM_VLIST = 'vbox-list';
const EPM_FLIST = 'ftp-list';
const EPM_ALIST = 'actions-list';
const EPM_POS = 'position';
const EPM_SSH_KEY = 'sshopen';
const EPM_SLIST = 'ssh-list';

function PlacesMenu() {
       this._init.apply(this, arguments);
}


PlacesMenu.prototype = {
    __proto__: PanelMenu.SystemStatusButton.prototype,

    _init: function() {
        PanelMenu.SystemStatusButton.prototype._init.call(this, 'folder');




        this._settings = new Main.Gio.Settings({ schema: EPM_SETTINGS_SCHEMA });
        vx = this._settings.get_strv(EPM_VLIST);
        fx = this._settings.get_strv(EPM_FLIST);
        ax = this._settings.get_strv(EPM_ALIST);
        sx = this._settings.get_strv(EPM_SLIST);
        pos = this._settings.get_string(EPM_POS);


        this._ftpclient = this._settings.get_string(EPM_FTP_KEY);
        this._fsclient = this._settings.get_string(EPM_FSOPEN_KEY);
        this._vbstate = this._settings.get_boolean(EPM_VBOX_KEY);
        this._cstate = this._settings.get_boolean(EPM_CBOX_KEY);
        this._bstate = this._settings.get_enum(EPM_BOOKMARKS_KEY);
        this._astate = this._settings.get_boolean(EPM_ACTIONS_KEY);
        this._sstate = this._settings.get_boolean(EPM_SSH_KEY);
        if(this._fsclient == 'root') {
           nautilusTorun = '/usr/bin/cinnamon-epmupdater -r root';
        }
        else{
           nautilusTorun = 'nautilus /';

        }
        this.defaultItems = [];
        this.bookmarkItems = [];
        this.deviceItems = [];
        this.ftpItems = [];
        this.vboxItems = [];
        this.fboxItems = [];
        this.actionItems = [];
        this.sshItems = [];
        this._createDefaultPlaces();
        this._createFbox();
        item = new PopupMenu.PopupSeparatorMenuItem();
        this.menu.addMenuItem(item);
        if(this._bstate == 1) {
           this._bookmarksSection = new PopupMenu.PopupSubMenuMenuItem(_("Bookmarks"));
           this.menu.addMenuItem(this._bookmarksSection);
        }
        if(this._bstate == 0) {}        
        this._createBookmarks();
        item = new PopupMenu.PopupSeparatorMenuItem();
        this.menu.addMenuItem(item);

       //following  lines are for Virtual Box submenu
        if(this._vbstate == true) {
           this._vboxSection = new PopupMenu.PopupSubMenuMenuItem(_("VirtualBox"));
           this.menu.addMenuItem(this._vboxSection);
           this._createVbox();
           item = new PopupMenu.PopupSeparatorMenuItem();
           this.menu.addMenuItem(item);
        }
        if(this._vbstate == false) {}

        //the following lines are for FTP submenu
        if(this._ftpclient == 'none') {}
        else {
           if(this._ftpclient == 'gFTP') {
              ftpicon = 'gftp';
              ftpcom = 'gftp bookmark://"';
              ftpnew = 'gftp';

           }
           if(this._ftpclient == 'Filezilla') {
              ftpicon = 'filezilla';
              ftpcom = 'filezilla -c "0/';
              ftpnew = 'filezilla';
           }
           this._ftpSection = new PopupMenu.PopupSubMenuMenuItem(this._ftpclient);
           this.menu.addMenuItem(this._ftpSection);
           this._createFtps();
           item = new PopupMenu.PopupSeparatorMenuItem();
           this.menu.addMenuItem(item);
        }

       //following  lines are for SSH submenu
        if(this._sstate == true) {
           this._sshSection = new PopupMenu.PopupSubMenuMenuItem(_("SSH Plus"));
           this.menu.addMenuItem(this._sshSection);
           this._createSSH();
           item = new PopupMenu.PopupSeparatorMenuItem();
           this.menu.addMenuItem(item);
        }
        if(this._sstate == false) {}


       //following  lines are for Actions submenu
        if(this._astate == true) {
           this._actionSection = new PopupMenu.PopupSubMenuMenuItem(_("Actions"));
           this.menu.addMenuItem(this._actionSection);
           this._createAction();
           item = new PopupMenu.PopupSeparatorMenuItem();
           this.menu.addMenuItem(item);
        }
        if(this._astate == false) {}

   
        //the following lines are for Removable Devices submenu
        this._devicesMenuItem = new PopupMenu.PopupSubMenuMenuItem(_("Removable Devices"));
        this.menu.addMenuItem(this._devicesMenuItem);
        this._createDevices();


        //the following lines are for Preferences
        item = new PopupMenu.PopupMenuItem(_("Preferences          "));
        item.connect('activate', Lang.bind(this, this._onPreferencesStart));
        this.menu.addMenuItem(item);

        Main.placesManager.connect('bookmarks-updated',Lang.bind(this,this._redisplayBookmarks));
        Main.placesManager.connect('mounts-updated',Lang.bind(this,this._redisplayDevices));

    },

    _onPreferencesStart: function() {
        Main.Util.spawnCommandLine('/usr/bin/cinnamon-epmupdater -s start');
    },

    getFtps : function() {
        this._ftps = [];
        this._reloadFtps();
            return this._ftps;
    },
    
    _reloadFtps : function() {
        this._ftps = [];
        let ftps = fx;
        for (let i = 0; i < ftps.length; i++) {
            let ftpLine = ftps[i];
            let label = ftpLine;
            let item = new PlaceDisplay.PlaceInfo('ftp:' + ftpLine, label,
                function(size) {
                    return new St.Icon({ icon_name: ftpicon,
                                         icon_type: St.IconType.FULLCOLOR,
                                         icon_size: size });
                },
                function() {
                    ftpTorun = ftpcom + ftpLine+'"';
                    Main.Util.spawnCommandLine(ftpTorun);
                });
            this._ftps.push(item);
        }
    },


    getAction : function() {
        this._action = [];
        this._reloadAction();
            return this._action;
    },

    _reloadAction : function() {
        this._action = [];
        let actions = ax;
        for (let i = 0; i < actions.length; i++) {
            let actionLine = actions[i];
            let sep = actionLine.split(':');
            let alabel = sep[0];
            let acom = sep[1];
            let item = new PlaceDisplay.PlaceInfo('action:' + acom, alabel,
                function(size) {
                    return new St.Icon({ icon_name: 'system-run',
                                         icon_type: St.IconType.FULLCOLOR,
                                         icon_size: size });
                },
                function() {
                    Main.Util.spawnCommandLine(acom);
                });
            this._action.push(item);
        }
    },

    getSSH : function() {
        this._ssh = [];
        this._reloadSSH();
            return this._ssh;
    },

    _reloadSSH : function() {
        this._ssh = [];
        let sshs = sx;
        for (let i = 0; i < sshs.length; i++) {
            let sshLine = sshs[i];
            let ssep = sshLine.split('|');
            let slabel = ssep[0];
            let scom = ssep[1];
            let sarg = ssep[2];
            let item = new PlaceDisplay.PlaceInfo('ssh:' + scom, slabel,
                function(size) {
                    return new St.Icon({ icon_name: 'gnome-terminal',
                                         icon_type: St.IconType.FULLCOLOR,
                                         icon_size: size });
                },
                function() {
                    ssc = scom+' '+sarg;
                    Main.Util.spawnCommandLine(ssc);
                });
            this._ssh.push(item);
        }
    },


    getFbox : function() {
        this._fbox = [];
        this._reloadFbox();
            return this._fbox;
    },
    _reloadFbox : function() {
        this._fbox = [];
        let filesystemFile = Main.Gio.file_new_for_path ('/');
        let filesystemUri = filesystemFile.get_uri();
        let filesystemLabel = Cinnamon.util_get_label_for_uri (filesystemUri);
        let filesystemIcon = Cinnamon.util_get_icon_for_uri (filesystemUri);

        this._filesystem = new PlaceDisplay.PlaceInfo('filesystem', filesystemLabel,
            function(size) {
                return St.TextureCache.get_default().load_gicon(null, filesystemIcon, size);
            },
            function() {
                Main.Util.spawnCommandLine(nautilusTorun);

            });
        this._fbox.push(this._filesystem);
        if(this._cstate == false) {}
        else{

        let computerUri = 'computer:///';
        let computerLabel = Cinnamon.util_get_label_for_uri (computerUri);
        this._computer = new PlaceDisplay.PlaceInfo('computer', computerLabel,
                function(size) {
                    return new St.Icon({ icon_name: 'computer',
                                         icon_type: St.IconType.FULLCOLOR,
                                         icon_size: size });
                },
            function(params) {
                computerTorun = 'nautilus '+computerUri;
                Main.Util.spawnCommandLine(computerTorun);
            });


        this._fbox.push(this._computer);
        }

        
    },

    getVbox : function() {
        this._vbox = [];
        this._reloadVbox();
            return this._vbox;
    },
    _reloadVbox : function() {
        this._vbox = [];
        let vboxs = vx;
        for (let i = 0; i < vboxs.length; i++) {
            let vboxLine = vboxs[i];
            let vlabel = vboxLine;
            let item = new PlaceDisplay.PlaceInfo('vbox:' + vboxLine, vlabel,
                function(size) {
                    return new St.Icon({ icon_name: 'VBox-gray',
                                         icon_type: St.IconType.FULLCOLOR,
                                         icon_size: size });
                },
                function() {
                    vboxTorun = '/usr/lib/virtualbox/VirtualBox --startvm "'+ vboxLine +'"';
                    Main.Util.spawnCommandLine(vboxTorun);
                });
            this._vbox.push(item);
        }
    },



    _createDefaultPlaces : function() {
        this.defaultPlaces = Main.placesManager.getDefaultPlaces();
        for (let placeid = 0; placeid < this.defaultPlaces.length; placeid++) {
            this.defaultItems[placeid] = new PopupMenu.PopupMenuItem(_(this.defaultPlaces[placeid].name));
            let icon = this.defaultPlaces[placeid].iconFactory(PLACE_ICON_SIZE);
            this.defaultItems[placeid].addActor(icon, { align: St.Align.END});
            this.defaultItems[placeid].place = this.defaultPlaces[placeid];
            this.menu.addMenuItem(this.defaultItems[placeid]);
            this.defaultItems[placeid].connect('activate', function(actor,event) {
                actor.place.launch();
            });

        }

    },


    _createBookmarks : function() {
        this.bookmarks = Main.placesManager.getBookmarks();
        for (let bookmarkid = 0; bookmarkid < this.bookmarks.length; bookmarkid++) {
            this.bookmarkItems[bookmarkid] = new PopupMenu.PopupMenuItem(_(this.bookmarks[bookmarkid].name));
            let icon = this.bookmarks[bookmarkid].iconFactory(PLACE_ICON_SIZE);
            if(icon != null) {
            this.bookmarkItems[bookmarkid].addActor(icon, { align: St.Align.END});
            this.bookmarkItems[bookmarkid].place = this.bookmarks[bookmarkid];
            if(this._bstate == 1) {
               this._bookmarksSection.menu.addMenuItem(this.bookmarkItems[bookmarkid]);
            }
            if(this._bstate == 0) {
               this.menu.addMenuItem(this.bookmarkItems[bookmarkid]);
            }
            
            this.bookmarkItems[bookmarkid].connect('activate', function(actor,event) {
                actor.place.launch();
            });
        }
      }
    },

    _createFbox : function() {
        this.fboxs = this.getFbox();
        for (let fboxid = 0; fboxid < this.fboxs.length; fboxid++) {
            this.fboxItems[fboxid] = new PopupMenu.PopupMenuItem(_(this.fboxs[fboxid].name));
            let icon = this.fboxs[fboxid].iconFactory(PLACE_ICON_SIZE);
            this.fboxItems[fboxid].addActor(icon, { align: St.Align.END});
            this.fboxItems[fboxid].place = this.fboxs[fboxid];
            this.menu.addMenuItem(this.fboxItems[fboxid]);
            this.fboxItems[fboxid].connect('activate', function(actor,event) {
                actor.place.launch();
            });
        }

    },

    _createVbox : function() {
        this.vboxs = this.getVbox();        
        this.newVbox = new PlaceDisplay.PlaceInfo('newvbox', _("VirtualBox"),
            function (size) {
                return new St.Icon({ icon_name: 'VBox-gray',
                                     icon_type: St.IconType.FULLCOLOR,
                                     icon_size: size });
            },
            function (params) {
                // action to start new VirtualBox instance
                Main.Util.spawn(['/usr/bin/VirtualBox']);
            });

        this.vboxs.push(this.newVbox);

        for (let vboxid = 0; vboxid < this.vboxs.length; vboxid++) {
            this.vboxItems[vboxid] = new PopupMenu.PopupMenuItem(_(this.vboxs[vboxid].name));
            let icon = this.vboxs[vboxid].iconFactory(PLACE_ICON_SIZE);
            this.vboxItems[vboxid].addActor(icon, { align: St.Align.END});
            this.vboxItems[vboxid].place = this.vboxs[vboxid];
            this._vboxSection.menu.addMenuItem(this.vboxItems[vboxid]);
            this.vboxItems[vboxid].connect('activate', function(actor,event) {
                actor.place.launch();
            });
        }

    },

    _createAction : function() {
        this.actions = this.getAction();        
        for (let actionid = 0; actionid < this.actions.length; actionid++) {
            this.actionItems[actionid] = new PopupMenu.PopupMenuItem(_(this.actions[actionid].name));
            let icon = this.actions[actionid].iconFactory(PLACE_ICON_SIZE);
            this.actionItems[actionid].addActor(icon, { align: St.Align.END});
            this.actionItems[actionid].place = this.actions[actionid];
            this._actionSection.menu.addMenuItem(this.actionItems[actionid]);
            this.actionItems[actionid].connect('activate', function(actor,event) {
                actor.place.launch();
            });
        }

    },

    _createSSH : function() {
        this.sshs = this.getSSH();        
        for (let sshid = 0; sshid < this.sshs.length; sshid++) {
            this.sshItems[sshid] = new PopupMenu.PopupMenuItem(_(this.sshs[sshid].name));
            let icon = this.sshs[sshid].iconFactory(PLACE_ICON_SIZE);
            this.sshItems[sshid].addActor(icon, { align: St.Align.END});
            this.sshItems[sshid].place = this.sshs[sshid];
            this._sshSection.menu.addMenuItem(this.sshItems[sshid]);
            this.sshItems[sshid].connect('activate', function(actor,event) {
                actor.place.launch();
            });
        }

    },

    _createFtps : function() {
        this.ftps = this.getFtps();
        this.newFtp = new PlaceDisplay.PlaceInfo('newftp', this._ftpclient,
            function (size) {
                return new St.Icon({ icon_name: ftpicon,
                                     icon_type: St.IconType.FULLCOLOR,
                                     icon_size: size });
            },
            function () {
                Main.Util.spawnCommandLine(ftpnew);
            });

        this.ftps.push(this.newFtp);

        for (let ftpid = 0; ftpid < this.ftps.length; ftpid++) {
            this.ftpItems[ftpid] = new PopupMenu.PopupMenuItem(_(this.ftps[ftpid].name));
            let icon = this.ftps[ftpid].iconFactory(PLACE_ICON_SIZE);
            this.ftpItems[ftpid].addActor(icon, { align: St.Align.END});
            this.ftpItems[ftpid].place = this.ftps[ftpid];
            this._ftpSection.menu.addMenuItem(this.ftpItems[ftpid]);
            this.ftpItems[ftpid].connect('activate', function(actor,event) {
                actor.place.launch();
            });
        }

    },

    _createDevices : function() {
        this.devices = Main.placesManager.getMounts();
        for (let devid = 0; devid < this.devices.length; devid++) {
            this.deviceItems[devid] = new PopupMenu.PopupMenuItem(_(this.devices[devid].name));
            let icon = this.devices[devid].iconFactory(PLACE_ICON_SIZE);
            this.deviceItems[devid].addActor(icon, { align: St.Align.END});
            this.deviceItems[devid].place = this.devices[devid];
            this._devicesMenuItem.menu.addMenuItem(this.deviceItems[devid]);
            this.deviceItems[devid].connect('activate', function(actor,event) {
                actor.place.launch();
            });
        }

        if (this.devices.length == 0)
            this._devicesMenuItem.actor.hide();
        else
            this._devicesMenuItem.actor.show();
            item = new PopupMenu.PopupSeparatorMenuItem();
            this.menu.addMenuItem(item);
    },


    _redisplayBookmarks: function(){
        this._clearBookmarks();
        this._createBookmarks();
    },

    _redisplayDevices: function(){
        this._clearDevices();
        this._createDevices();
    },

    _clearBookmarks : function(){
        this._bookmarksSection.removeAll();
        this.bookmarkItems = [];
    },

    _clearDevices : function(){
        this._devicesMenuItem.menu.removeAll();
        this.DeviceItems = [];
    },
};


function init(metadata) {
    imports.gettext.bindtextdomain('cinnamon-extensions-extended-places-menu', metadata.localedir);
}

let _indicator;

function enable() {
    _indicator = new PlacesMenu;
    if(pos == 'right'){
        Main.panel.addToStatusArea('cinnamon-extensions-extended-places-menu', _indicator);
    }
    else{

        var leftChildren = Main.panel._leftBox.get_children_list();
        var ind_pos = leftChildren.length - 1;
        Main.panel._leftBox.insert_actor(_indicator.actor, ind_pos);
        Main.panel._leftBox.child_set(_indicator.actor, { y_fill : true } );
        Main.panel._menus.addMenu(_indicator.menu);
    }

}

function disable() {
    _indicator.destroy();
}       
