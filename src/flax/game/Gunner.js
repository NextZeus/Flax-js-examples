/**
 * Created by long on 14-4-24.
 */
var flax = flax || {};

flax.GunnerCamp = {
    player:"Player",
    enemy:"Enemy"
};
flax._gunnerDefine = {
    camp:null,//Player or Enemy?
    _gunParam:null,//see flax.GunParam, remember the anchors, ["weapon1","weapon2"]
    targets:null,//the targets array of the enemy
    aimTarget:null,//the target the guns will aimed to
    alwaysBind:true,//if the gun always bind to the anchor every frame
    _guns:null,
    _autoShooting:false,
    _waitingShoot:false,
    _auto:false,//if true, will auto shoot according to the gunParam

    onEnter:function()
    {
        this._super();
        this._guns = [];
        if(this._gunParam) this.setGunParam(this._gunParam);
    },
    onRecycle:function()
    {
        this._super();
        this.stopShoot();
    },
    getGunParam:function(){
        return this._gunParam;
    },
    setGunParam:function(param)
    {
        this._gunParam = param;
        if(this.parent == null) return;
        if(param.gunAnchors == null){
            cc.log("Please set the gunAnchors param!");
            return;
        }
        var i = -1;
        var n = param.gunAnchors.length;
        var gunAnchor = null;
        var gun = null;
        while(++i < n)
        {
            gunAnchor = param.gunAnchors[i];
            gun = flax.Gun.create(this._gunParam);
            if(this.bindAnchor(gunAnchor, gun, this.alwaysBind)) {
                gun.owner = this;
                gun.name = gunAnchor;
                this[gunAnchor] = gun;
                this._guns.push(gun);
            }
        }
        if(this._waitingShoot){
            this.scheduleOnce(this.autoShoot, 0.1);
        }
    },
    shoot:function(){
        this._auto = false;
        if(this.aimTarget) {
            this._aimToTarget();
        }
        this._doBeginShoot();
    },
    autoShoot:function(delay)
    {
        this._auto = true;
        if(this.parent == null || this._guns == null || this._guns.length == 0) {
            this._waitingShoot = true;
            return;
        }
        if(this.aimTarget){
            this._aimToTarget();
        }

        if(delay > 0){
            this.scheduleOnce(this._doBeginShoot, delay);
        }else{
            this._doBeginShoot();
        }
        this._autoShooting = true;
        this._waitingShoot = false;
    },
    _aimToTarget:function(){
        if(!this.aimTarget) return;
        if(this.targets == null) this.targets = [this.aimTarget];
        else if(this.targets.indexOf(this.aimTarget) == -1) this.targets.push(this.aimTarget);
        var i = -1;
        var n = this._guns.length;
        var gun = null;
        while(++i < n)
        {
            gun = this._guns[i];
            gun.aimTarget = this.aimTarget;
        }
    },
    _doBeginShoot:function()
    {
        var i = -1;
        var n = this._guns.length;
        while(++i < n)
        {
            if(this._auto) this._guns[i].start();
            else this._guns[i].shootOnce();
        }
    },
    stopShoot:function()
    {
        this._autoShooting = false;
        if(this._guns == null || this._guns.length == 0) return;
        var i = -1;
        var n = this._guns.length;
        while(++i < n)
        {
            this._guns[i].end();
        }
    },
    upgradeGun:function(deltaParam, time)
    {
        var delta = this._deltaGunParam(deltaParam);
        if(!isNaN(time) && time > 0){
            this.scheduleOnce(function(){
                this._deltaGunParam(delta);
            }, time);
        }else{
            this._deltaGunParam(delta);
        }
    },
    _deltaGunParam:function(param)
    {
        if(this._guns.length == 0) return;
        var delta = {};
        var newValue = 0;
        for(var k in param){
            newValue = this._guns[0]["param"][k] + param[k];
            if(newValue <= 0) {
                delete param[k];
                continue;
            }
            delta[k] = -param[k];
            param[k] = newValue;
        }
        var i = this._guns.length;
        var gun = null;
        while(i--)
        {
            gun = this._guns[i];
            gun.updateParam(param);
        }
        return delta;
    },
    _onDie:function()
    {
        this.stopShoot();
        if(this.ownerBody) this.ownerBody.destroy();
        else this.destroy();
    }
};

flax.Gunner = flax.Animator.extend(flax._gunnerDefine);
flax.MCGunner = flax.MovieClip.extend(flax._gunnerDefine);

flax.addModule(flax.Gunner, flax.HealthModule, false);
flax.addModule(flax.MCGunner, flax.HealthModule, false);

window._p = flax.Gunner.prototype;

_p.gunParam;
cc.defineGetterSetter(_p, "gunParam", _p.getGunParam, _p.setGunParam);

window._p = flax.MCGunner.prototype;

_p.gunParam;
cc.defineGetterSetter(_p, "gunParam", _p.getGunParam, _p.setGunParam);

delete window._p;

flax.Gunner.create = function(assetsFile, assetID)
{
    var h = new flax.Gunner(assetsFile, assetID);
    h.clsName = "flax.Gunner";
    return h;
};

flax.MCGunner.create = function(assetsFile, assetID)
{
    var h = new flax.MCGunner(assetsFile, assetID);
    h.clsName = "flax.MCGunner";
    return h;
};



