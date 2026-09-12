!(function(){"use strict";var Aw=Object.defineProperty,kw=Object.defineProperties;var ww=Object.getOwnPropertyDescriptors;var ad=Object.getOwnPropertySymbols,Sw=Object.getPrototypeOf,Mf=Object.prototype.hasOwnProperty,Df=Object.prototype.propertyIsEnumerable,Iw=Reflect.get;var xf=q=>{throw TypeError(q)},Of=Math.pow,kh=(q,Y,$)=>Y in q?Aw(q,Y,{enumerable:!0,configurable:!0,writable:!0,value:$}):q[Y]=$,U=(q,Y)=>{for(var $ in Y||(Y={}))Mf.call(Y,$)&&kh(q,$,Y[$]);if(ad)for(var $ of ad(Y))Df.call(Y,$)&&kh(q,$,Y[$]);return q},da=(q,Y)=>kw(q,ww(Y));var Yr=(q,Y)=>{var $={};for(var ve in q)Mf.call(q,ve)&&Y.indexOf(ve)<0&&($[ve]=q[ve]);if(q!=null&&ad)for(var ve of ad(q))Y.indexOf(ve)<0&&Df.call(q,ve)&&($[ve]=q[ve]);return $};var Nf=(q,Y,$)=>kh(q,typeof Y!="symbol"?Y+"":Y,$),wh=(q,Y,$)=>Y.has(q)||xf("Cannot "+$);var k=(q,Y,$)=>(wh(q,Y,"read from private field"),$?$.call(q):Y.get(q)),Ze=(q,Y,$)=>Y.has(q)?xf("Cannot add the same private member more than once"):Y instanceof WeakSet?Y.add(q):Y.set(q,$),lt=(q,Y,$,ve)=>(wh(q,Y,"write to private field"),ve?ve.call(q,$):Y.set(q,$),$),It=(q,Y,$)=>(wh(q,Y,"access private method"),$);var Gr=(q,Y,$)=>Iw(Sw(q),$,Y);var W=(q,Y,$)=>new Promise((ve,ms)=>{var ps=_i=>{try{zr($.next(_i))}catch(Qr){ms(Qr)}},rd=_i=>{try{zr($.throw(_i))}catch(Qr){ms(Qr)}},zr=_i=>_i.done?ve(_i.value):Promise.resolve(_i.value).then(ps,rd);zr(($=$.apply(q,Y)).next())});(self.webpackChunkcog_flow_fe=self.webpackChunkcog_flow_fe||[]).push([[2723],{70994:(function(q,Y,$){var ee,Vr,Je,Ft,Pa,Ua,la,td,ds,pe,Ha,Pf,Uf,Sh,Bf,Ih,Hf,Rh;$.r(Y),$.d(Y,{MaxResolution:function(){return lg},MediaError:function(){return M},MinResolution:function(){return dg},RenditionOrder:function(){return ug},default:function(){return vw},generatePlayerInitTime:function(){return Ss},playerSoftwareName:function(){return bf},playerSoftwareVersion:function(){return Ef}});var ve=$(96540),ms=Object.create,ps=Object.defineProperty,rd=Object.getOwnPropertyDescriptor,zr=Object.getOwnPropertyNames,_i=Object.getPrototypeOf,Qr=Object.prototype.hasOwnProperty,Lh=function(e,t){return function(){return e&&(t=e(e=0)),t}},it=function(e,t){return function(){return t||e((t={exports:{}}).exports,t),t.exports}},Kf=function(e,t,i,a){if(t&&typeof t=="object"||typeof t=="function")for(var r=zr(t),n=0,s=r.length,o;n<s;n++)o=r[n],!Qr.call(e,o)&&o!==i&&ps(e,o,{get:function(l){return t[l]}.bind(null,o),enumerable:!(a=rd(t,o))||a.enumerable});return e},_t=function(e,t,i){return i=e!=null?ms(_i(e)):{},Kf(t||!e||!e.__esModule?ps(i,"default",{value:e,enumerable:!0}):i,e)},qt=it(function(e,t){var i;typeof window!="undefined"?i=window:typeof $.g!="undefined"?i=$.g:typeof self!="undefined"?i=self:i={},t.exports=i});function ua(e,t){return t!=null&&typeof Symbol!="undefined"&&t[Symbol.hasInstance]?!!t[Symbol.hasInstance](e):ua(e,t)}var ca=Lh(function(){ca()});function Ch(e){"@swc/helpers - typeof";return e&&typeof Symbol!="undefined"&&e.constructor===Symbol?"symbol":typeof e}var Mh=Lh(function(){}),Dh=it(function(e,t){var i=Array.prototype.slice;t.exports=a;function a(r,n){for(("length"in r)||(r=[r]),r=i.call(r);r.length;){var s=r.shift(),o=n(s);if(o)return o;s.childNodes&&s.childNodes.length&&(r=i.call(s.childNodes).concat(r))}}}),$f=it(function(e,t){ca(),t.exports=i;function i(a,r){if(!ua(this,i))return new i(a,r);this.data=a,this.nodeValue=a,this.length=a.length,this.ownerDocument=r||null}i.prototype.nodeType=8,i.prototype.nodeName="#comment",i.prototype.toString=function(){return"[object Comment]"}}),Vf=it(function(e,t){ca(),t.exports=i;function i(a,r){if(!ua(this,i))return new i(a);this.data=a||"",this.length=this.data.length,this.ownerDocument=r||null}i.prototype.type="DOMTextNode",i.prototype.nodeType=3,i.prototype.nodeName="#text",i.prototype.toString=function(){return this.data},i.prototype.replaceData=function(a,r,n){var s=this.data,o=s.substring(0,a),l=s.substring(a+r,s.length);this.data=o+n+l,this.length=this.data.length}}),xh=it(function(e,t){t.exports=i;function i(a){var r=this,n=a.type;a.target||(a.target=r),r.listeners||(r.listeners={});var s=r.listeners[n];if(s)return s.forEach(function(o){a.currentTarget=r,typeof o=="function"?o(a):o.handleEvent(a)});r.parentNode&&r.parentNode.dispatchEvent(a)}}),Oh=it(function(e,t){t.exports=i;function i(a,r){var n=this;n.listeners||(n.listeners={}),n.listeners[a]||(n.listeners[a]=[]),n.listeners[a].indexOf(r)===-1&&n.listeners[a].push(r)}}),Nh=it(function(e,t){t.exports=i;function i(a,r){var n=this;if(n.listeners&&n.listeners[a]){var s=n.listeners[a],o=s.indexOf(r);o!==-1&&s.splice(o,1)}}}),qf=it(function(e,t){Mh(),t.exports=a;var i=["area","base","br","col","embed","hr","img","input","keygen","link","menuitem","meta","param","source","track","wbr"];function a(d){switch(d.nodeType){case 3:return p(d.data);case 8:return"<!--"+d.data+"-->";default:return r(d)}}function r(d){var u=[],m=d.tagName;return d.namespaceURI==="http://www.w3.org/1999/xhtml"&&(m=m.toLowerCase()),u.push("<"+m+c(d)+o(d)),i.indexOf(m)>-1?u.push(" />"):(u.push(">"),d.childNodes.length?u.push.apply(u,d.childNodes.map(a)):d.textContent||d.innerText?u.push(p(d.textContent||d.innerText)):d.innerHTML&&u.push(d.innerHTML),u.push("</"+m+">")),u.join("")}function n(d,u){var m=Ch(d[u]);return u==="style"&&Object.keys(d.style).length>0?!0:d.hasOwnProperty(u)&&(m==="string"||m==="boolean"||m==="number")&&u!=="nodeName"&&u!=="className"&&u!=="tagName"&&u!=="textContent"&&u!=="innerText"&&u!=="namespaceURI"&&u!=="innerHTML"}function s(d){if(typeof d=="string")return d;var u="";return Object.keys(d).forEach(function(m){var _=d[m];m=m.replace(/[A-Z]/g,function(y){return"-"+y.toLowerCase()}),u+=m+":"+_+";"}),u}function o(d){var u=d.dataset,m=[];for(var _ in u)m.push({name:"data-"+_,value:u[_]});return m.length?l(m):""}function l(d){var u=[];return d.forEach(function(m){var _=m.name,y=m.value;_==="style"&&(y=s(y)),u.push(_+'="'+v(y)+'"')}),u.length?" "+u.join(" "):""}function c(d){var u=[];for(var m in d)n(d,m)&&u.push({name:m,value:d[m]});for(var _ in d._attributes)for(var y in d._attributes[_]){var g=d._attributes[_][y],A=(g.prefix?g.prefix+":":"")+y;u.push({name:A,value:g.value})}return d.className&&u.push({name:"class",value:d.className}),u.length?l(u):""}function p(d){var u="";return typeof d=="string"?u=d:d&&(u=d.toString()),u.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function v(d){return p(d).replace(/"/g,"&quot;")}}),Ph=it(function(e,t){ca();var i=Dh(),a=xh(),r=Oh(),n=Nh(),s=qf(),o="http://www.w3.org/1999/xhtml";t.exports=l;function l(c,p,v){if(!ua(this,l))return new l(c);var d=v===void 0?o:v||null;this.tagName=d===o?String(c).toUpperCase():c,this.nodeName=this.tagName,this.className="",this.dataset={},this.childNodes=[],this.parentNode=null,this.style={},this.ownerDocument=p||null,this.namespaceURI=d,this._attributes={},this.tagName==="INPUT"&&(this.type="text")}l.prototype.type="DOMElement",l.prototype.nodeType=1,l.prototype.appendChild=function(c){return c.parentNode&&c.parentNode.removeChild(c),this.childNodes.push(c),c.parentNode=this,c},l.prototype.replaceChild=function(c,p){c.parentNode&&c.parentNode.removeChild(c);var v=this.childNodes.indexOf(p);return p.parentNode=null,this.childNodes[v]=c,c.parentNode=this,p},l.prototype.removeChild=function(c){var p=this.childNodes.indexOf(c);return this.childNodes.splice(p,1),c.parentNode=null,c},l.prototype.insertBefore=function(c,p){c.parentNode&&c.parentNode.removeChild(c);var v=p==null?-1:this.childNodes.indexOf(p);return v>-1?this.childNodes.splice(v,0,c):this.childNodes.push(c),c.parentNode=this,c},l.prototype.setAttributeNS=function(c,p,v){var d=null,u=p,m=p.indexOf(":");if(m>-1&&(d=p.substr(0,m),u=p.substr(m+1)),this.tagName==="INPUT"&&p==="type")this.type=v;else{var _=this._attributes[c]||(this._attributes[c]={});_[u]={value:v,prefix:d}}},l.prototype.getAttributeNS=function(c,p){var v=this._attributes[c],d=v&&v[p]&&v[p].value;return this.tagName==="INPUT"&&p==="type"?this.type:typeof d!="string"?null:d},l.prototype.removeAttributeNS=function(c,p){var v=this._attributes[c];v&&delete v[p]},l.prototype.hasAttributeNS=function(c,p){var v=this._attributes[c];return!!v&&p in v},l.prototype.setAttribute=function(c,p){return this.setAttributeNS(null,c,p)},l.prototype.getAttribute=function(c){return this.getAttributeNS(null,c)},l.prototype.removeAttribute=function(c){return this.removeAttributeNS(null,c)},l.prototype.hasAttribute=function(c){return this.hasAttributeNS(null,c)},l.prototype.removeEventListener=n,l.prototype.addEventListener=r,l.prototype.dispatchEvent=a,l.prototype.focus=function(){},l.prototype.toString=function(){return s(this)},l.prototype.getElementsByClassName=function(c){var p=c.split(" "),v=[];return i(this,function(d){if(d.nodeType===1){var u=d.className||"",m=u.split(" ");p.every(function(_){return m.indexOf(_)!==-1})&&v.push(d)}}),v},l.prototype.getElementsByTagName=function(c){c=c.toLowerCase();var p=[];return i(this.childNodes,function(v){v.nodeType===1&&(c==="*"||v.tagName.toLowerCase()===c)&&p.push(v)}),p},l.prototype.contains=function(c){return i(this,function(p){return c===p})||!1}}),Yf=it(function(e,t){ca();var i=Ph();t.exports=a;function a(r){if(!ua(this,a))return new a;this.childNodes=[],this.parentNode=null,this.ownerDocument=r||null}a.prototype.type="DocumentFragment",a.prototype.nodeType=11,a.prototype.nodeName="#document-fragment",a.prototype.appendChild=i.prototype.appendChild,a.prototype.replaceChild=i.prototype.replaceChild,a.prototype.removeChild=i.prototype.removeChild,a.prototype.toString=function(){return this.childNodes.map(function(r){return String(r)}).join("")}}),Gf=it(function(e,t){t.exports=i;function i(a){}i.prototype.initEvent=function(a,r,n){this.type=a,this.bubbles=r,this.cancelable=n},i.prototype.preventDefault=function(){}}),zf=it(function(e,t){ca();var i=Dh(),a=$f(),r=Vf(),n=Ph(),s=Yf(),o=Gf(),l=xh(),c=Oh(),p=Nh();t.exports=v;function v(){if(!ua(this,v))return new v;this.head=this.createElement("head"),this.body=this.createElement("body"),this.documentElement=this.createElement("html"),this.documentElement.appendChild(this.head),this.documentElement.appendChild(this.body),this.childNodes=[this.documentElement],this.nodeType=9}var d=v.prototype;d.createTextNode=function(u){return new r(u,this)},d.createElementNS=function(u,m){var _=u===null?null:String(u);return new n(m,this,_)},d.createElement=function(u){return new n(u,this)},d.createDocumentFragment=function(){return new s(this)},d.createEvent=function(u){return new o(u)},d.createComment=function(u){return new a(u,this)},d.getElementById=function(u){u=String(u);var m=i(this.childNodes,function(_){if(String(_.id)===u)return _});return m||null},d.getElementsByClassName=n.prototype.getElementsByClassName,d.getElementsByTagName=n.prototype.getElementsByTagName,d.contains=n.prototype.contains,d.removeEventListener=p,d.addEventListener=c,d.dispatchEvent=l}),Qf=it(function(e,t){var i=zf();t.exports=new i}),Uh=it(function(e,t){var i=typeof $.g!="undefined"?$.g:typeof window!="undefined"?window:{},a=Qf(),r;typeof document!="undefined"?r=document:(r=i["__GLOBAL_DOCUMENT_CACHE@4"],r||(r=i["__GLOBAL_DOCUMENT_CACHE@4"]=a)),t.exports=r});function Zf(e){if(Array.isArray(e))return e}function jf(e,t){var i=e==null?null:typeof Symbol!="undefined"&&e[Symbol.iterator]||e["@@iterator"];if(i!=null){var a=[],r=!0,n=!1,s,o;try{for(i=i.call(e);!(r=(s=i.next()).done)&&(a.push(s.value),!(t&&a.length===t));r=!0);}catch(l){n=!0,o=l}finally{try{!r&&i.return!=null&&i.return()}finally{if(n)throw o}}return a}}function Xf(){throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function nd(e,t){(t==null||t>e.length)&&(t=e.length);for(var i=0,a=new Array(t);i<t;i++)a[i]=e[i];return a}function Bh(e,t){if(e){if(typeof e=="string")return nd(e,t);var i=Object.prototype.toString.call(e).slice(8,-1);if(i==="Object"&&e.constructor&&(i=e.constructor.name),i==="Map"||i==="Set")return Array.from(i);if(i==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(i))return nd(e,t)}}function fi(e,t){return Zf(e)||jf(e,t)||Bh(e,t)||Xf()}var Zr=_t(qt()),Hh=_t(qt()),Jf=_t(qt()),eE={now:function(){var e=Jf.default.performance,t=e&&e.timing,i=t&&t.navigationStart,a=typeof i=="number"&&typeof e.now=="function"?i+e.now():Date.now();return Math.round(a)}},He=eE,jr=function(){var e,t,i;if(typeof((e=Hh.default.crypto)===null||e===void 0?void 0:e.getRandomValues)=="function"){i=new Uint8Array(32),Hh.default.crypto.getRandomValues(i);for(var a=0;a<32;a++)i[a]=i[a]%16}else{i=[];for(var r=0;r<32;r++)i[r]=Math.random()*16|0}var n=0;t="xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(l){var c=l==="x"?i[n]:i[n]&3|8;return n++,c.toString(16)});var s=He.now(),o=s==null?void 0:s.toString(16).substring(3);return o?t.substring(0,28)+o:t},Wh=function(){return("000000"+(Math.random()*Math.pow(36,6)<<0).toString(36)).slice(-6)},Rt=function(e){if(e&&typeof e.nodeName!="undefined")return e.muxId||(e.muxId=Wh()),e.muxId;var t;try{t=document.querySelector(e)}catch(i){}return t&&!t.muxId&&(t.muxId=e),(t==null?void 0:t.muxId)||e},vs=function(e){var t;e&&typeof e.nodeName!="undefined"?(t=e,e=Rt(t)):t=document.querySelector(e);var i=t&&t.nodeName?t.nodeName.toLowerCase():"";return[t,e,i]};function tE(e){if(Array.isArray(e))return nd(e)}function iE(e){if(typeof Symbol!="undefined"&&e[Symbol.iterator]!=null||e["@@iterator"]!=null)return Array.from(e)}function aE(){throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function Lt(e){return tE(e)||iE(e)||Bh(e)||aE()}var ha={TRACE:0,DEBUG:1,INFO:2,WARN:3,ERROR:4,SILENT:5},rE=function(e){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:3,i,a,r,n,s,o=e?[console,e]:[console],l=(i=console.trace).bind.apply(i,Lt(o)),c=(a=console.info).bind.apply(a,Lt(o)),p=(r=console.debug).bind.apply(r,Lt(o)),v=(n=console.warn).bind.apply(n,Lt(o)),d=(s=console.error).bind.apply(s,Lt(o)),u=t;return{trace:function(){for(var m=arguments.length,_=new Array(m),y=0;y<m;y++)_[y]=arguments[y];if(!(u>ha.TRACE))return l.apply(void 0,Lt(_))},debug:function(){for(var m=arguments.length,_=new Array(m),y=0;y<m;y++)_[y]=arguments[y];if(!(u>ha.DEBUG))return p.apply(void 0,Lt(_))},info:function(){for(var m=arguments.length,_=new Array(m),y=0;y<m;y++)_[y]=arguments[y];if(!(u>ha.INFO))return c.apply(void 0,Lt(_))},warn:function(){for(var m=arguments.length,_=new Array(m),y=0;y<m;y++)_[y]=arguments[y];if(!(u>ha.WARN))return v.apply(void 0,Lt(_))},error:function(){for(var m=arguments.length,_=new Array(m),y=0;y<m;y++)_[y]=arguments[y];if(!(u>ha.ERROR))return d.apply(void 0,Lt(_))},get level(){return u},set level(m){m!==this.level&&(u=m!=null?m:t)}}},ue=rE("[mux]"),sd=_t(qt());function od(){var e=sd.default.doNotTrack||sd.default.navigator&&sd.default.navigator.doNotTrack;return e==="1"}function F(e){if(e===void 0)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}ca();function ke(e,t){if(!ua(e,t))throw new TypeError("Cannot call a class as a function")}function Fh(e,t){for(var i=0;i<t.length;i++){var a=t[i];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(e,a.key,a)}}function ft(e,t,i){return t&&Fh(e.prototype,t),i&&Fh(e,i),e}function C(e,t,i){return t in e?Object.defineProperty(e,t,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[t]=i,e}function Wa(e){return Wa=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)},Wa(e)}function nE(e,t){for(;!Object.prototype.hasOwnProperty.call(e,t)&&(e=Wa(e),e!==null););return e}function _s(e,t,i){return typeof Reflect!="undefined"&&Reflect.get?_s=Reflect.get:_s=function(a,r,n){var s=nE(a,r);if(s){var o=Object.getOwnPropertyDescriptor(s,r);return o.get?o.get.call(n||a):o.value}},_s(e,t,i||e)}function ld(e,t){return ld=Object.setPrototypeOf||function(i,a){return i.__proto__=a,i},ld(e,t)}function sE(e,t){if(typeof t!="function"&&t!==null)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&ld(e,t)}function oE(e,t){if(e==null)return{};var i={},a=Object.keys(e),r,n;for(n=0;n<a.length;n++)r=a[n],!(t.indexOf(r)>=0)&&(i[r]=e[r]);return i}function lE(e,t){if(e==null)return{};var i=oE(e,t),a,r;if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);for(r=0;r<n.length;r++)a=n[r],!(t.indexOf(a)>=0)&&Object.prototype.propertyIsEnumerable.call(e,a)&&(i[a]=e[a])}return i}function dE(){if(typeof Reflect=="undefined"||!Reflect.construct||Reflect.construct.sham)return!1;if(typeof Proxy=="function")return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){})),!0}catch(e){return!1}}Mh();function uE(e,t){return t&&(Ch(t)==="object"||typeof t=="function")?t:F(e)}function cE(e){var t=dE();return function(){var i=Wa(e),a;if(t){var r=Wa(this).constructor;a=Reflect.construct(i,arguments,r)}else a=i.apply(this,arguments);return uE(this,a)}}var Ct=function(e){return Xr(e)[0]},Xr=function(e){if(typeof e!="string"||e==="")return["localhost"];var t=/^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/,i=e.match(t)||[],a=i[4],r;return a&&(r=(a.match(/[^\.]+\.[^\.]+$/)||[])[0]),[a,r]},dd=_t(qt()),hE={exists:function(){var e=dd.default.performance,t=e&&e.timing;return t!==void 0},domContentLoadedEventEnd:function(){var e=dd.default.performance,t=e&&e.timing;return t&&t.domContentLoadedEventEnd},navigationStart:function(){var e=dd.default.performance,t=e&&e.timing;return t&&t.navigationStart}},fs=hE;function Oe(e,t,i){i=i===void 0?1:i,e[t]=e[t]||0,e[t]+=i}function Jr(e){for(var t=1;t<arguments.length;t++){var i=arguments[t]!=null?arguments[t]:{},a=Object.keys(i);typeof Object.getOwnPropertySymbols=="function"&&(a=a.concat(Object.getOwnPropertySymbols(i).filter(function(r){return Object.getOwnPropertyDescriptor(i,r).enumerable}))),a.forEach(function(r){C(e,r,i[r])})}return e}function mE(e,t){var i=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter(function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable})),i.push.apply(i,a)}return i}function ud(e,t){return t=t!=null?t:{},Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):mE(Object(t)).forEach(function(i){Object.defineProperty(e,i,Object.getOwnPropertyDescriptor(t,i))}),e}var pE=["x-cdn","content-type"],Kh=["x-request-id","cf-ray","x-amz-cf-id","x-akamai-request-id"],vE=pE.concat(Kh);function cd(e){e=e||"";var t={},i=e.trim().split(/[\r\n]+/);return i.forEach(function(a){if(a){var r=a.split(": "),n=r.shift();n&&(vE.indexOf(n.toLowerCase())>=0||n.toLowerCase().indexOf("x-litix-")===0)&&(t[n]=r.join(": "))}}),t}function Es(e){if(e){var t=Kh.find(function(i){return e[i]!==void 0});return t?e[t]:void 0}}var _E=function(e){var t={};for(var i in e){var a=e[i],r=a["DATA-ID"].search("io.litix.data.");if(r!==-1){var n=a["DATA-ID"].replace("io.litix.data.","");t[n]=a.VALUE}}return t},$h=_E,bs=function(e){if(!e)return{};var t=fs.navigationStart(),i=e.loading,a=i?i.start:e.trequest,r=i?i.first:e.tfirst,n=i?i.end:e.tload;return{bytesLoaded:e.total,requestStart:Math.round(t+a),responseStart:Math.round(t+r),responseEnd:Math.round(t+n)}},en=function(e){if(!(!e||typeof e.getAllResponseHeaders!="function"))return cd(e.getAllResponseHeaders())},fE=function(e,t,i){var a=arguments.length>3&&arguments[3]!==void 0?arguments[3]:{},r=arguments.length>4?arguments[4]:void 0,n=e.log,s=e.utils.secondsToMs,o=function(g){var A=parseInt(r.version),E;return A===1&&g.programDateTime!==null&&(E=g.programDateTime),A===0&&g.pdt!==null&&(E=g.pdt),E};if(!fs.exists()){n.warn("performance timing not supported. Not tracking HLS.js.");return}var l=function(g,A){return e.emit(t,g,A)},c=function(g,A){var E=A.levels,T=A.audioTracks,L=A.url,I=A.stats,S=A.networkDetails,H=A.sessionData,G={},ne={};E.forEach(function(De,ot){G[ot]={width:De.width,height:De.height,bitrate:De.bitrate,attrs:De.attrs}}),T.forEach(function(De,ot){ne[ot]={name:De.name,language:De.lang,bitrate:De.bitrate}});var z=bs(I),V=z.bytesLoaded,ze=z.requestStart,ht=z.responseStart,mt=z.responseEnd;l("requestcompleted",ud(Jr({},$h(H)),{request_event_type:g,request_bytes_loaded:V,request_start:ze,request_response_start:ht,request_response_end:mt,request_type:"manifest",request_hostname:Ct(L),request_response_headers:en(S),request_rendition_lists:{media:G,audio:ne,video:{}}}))};i.on(r.Events.MANIFEST_LOADED,c);var p=function(g,A){var E=A.details,T=A.level,L=A.networkDetails,I=A.stats,S=bs(I),H=S.bytesLoaded,G=S.requestStart,ne=S.responseStart,z=S.responseEnd,V=E.fragments[E.fragments.length-1],ze=o(V)+s(V.duration);l("requestcompleted",{request_event_type:g,request_bytes_loaded:H,request_start:G,request_response_start:ne,request_response_end:z,request_current_level:T,request_type:"manifest",request_hostname:Ct(E.url),request_response_headers:en(L),video_holdback:E.holdBack&&s(E.holdBack),video_part_holdback:E.partHoldBack&&s(E.partHoldBack),video_part_target_duration:E.partTarget&&s(E.partTarget),video_target_duration:E.targetduration&&s(E.targetduration),video_source_is_live:E.live,player_manifest_newest_program_time:isNaN(ze)?void 0:ze})};i.on(r.Events.LEVEL_LOADED,p);var v=function(g,A){var E=A.details,T=A.networkDetails,L=A.stats,I=bs(L),S=I.bytesLoaded,H=I.requestStart,G=I.responseStart,ne=I.responseEnd;l("requestcompleted",{request_event_type:g,request_bytes_loaded:S,request_start:H,request_response_start:G,request_response_end:ne,request_type:"manifest",request_hostname:Ct(E.url),request_response_headers:en(T)})};i.on(r.Events.AUDIO_TRACK_LOADED,v);var d=function(g,A){var E=A.stats,T=A.networkDetails,L=A.frag;E=E||L.stats;var I=bs(E),S=I.bytesLoaded,H=I.requestStart,G=I.responseStart,ne=I.responseEnd,z=T?en(T):void 0,V={request_event_type:g,request_bytes_loaded:S,request_start:H,request_response_start:G,request_response_end:ne,request_hostname:T?Ct(T.responseURL):void 0,request_id:z?Es(z):void 0,request_response_headers:z,request_media_duration:L.duration,request_url:T==null?void 0:T.responseURL};L.type==="main"?(V.request_type="media",V.request_current_level=L.level,V.request_video_width=(i.levels[L.level]||{}).width,V.request_video_height=(i.levels[L.level]||{}).height,V.request_labeled_bitrate=(i.levels[L.level]||{}).bitrate):V.request_type=L.type,l("requestcompleted",V)};i.on(r.Events.FRAG_LOADED,d);var u=function(g,A){var E=A.frag,T=E.start,L=o(E),I={currentFragmentPDT:L,currentFragmentStart:s(T)};l("fragmentchange",I)};i.on(r.Events.FRAG_CHANGED,u);var m=function(g,A){var E=A.type,T=A.details,L=A.response,I=A.fatal,S=A.frag,H=A.networkDetails,G=(S==null?void 0:S.url)||A.url||"",ne=H?en(H):void 0;if((T===r.ErrorDetails.MANIFEST_LOAD_ERROR||T===r.ErrorDetails.MANIFEST_LOAD_TIMEOUT||T===r.ErrorDetails.FRAG_LOAD_ERROR||T===r.ErrorDetails.FRAG_LOAD_TIMEOUT||T===r.ErrorDetails.LEVEL_LOAD_ERROR||T===r.ErrorDetails.LEVEL_LOAD_TIMEOUT||T===r.ErrorDetails.AUDIO_TRACK_LOAD_ERROR||T===r.ErrorDetails.AUDIO_TRACK_LOAD_TIMEOUT||T===r.ErrorDetails.SUBTITLE_LOAD_ERROR||T===r.ErrorDetails.SUBTITLE_LOAD_TIMEOUT||T===r.ErrorDetails.KEY_LOAD_ERROR||T===r.ErrorDetails.KEY_LOAD_TIMEOUT)&&l("requestfailed",{request_error:T,request_url:G,request_hostname:Ct(G),request_id:ne?Es(ne):void 0,request_type:T===r.ErrorDetails.FRAG_LOAD_ERROR||T===r.ErrorDetails.FRAG_LOAD_TIMEOUT?"media":T===r.ErrorDetails.AUDIO_TRACK_LOAD_ERROR||T===r.ErrorDetails.AUDIO_TRACK_LOAD_TIMEOUT?"audio":T===r.ErrorDetails.SUBTITLE_LOAD_ERROR||T===r.ErrorDetails.SUBTITLE_LOAD_TIMEOUT?"subtitle":T===r.ErrorDetails.KEY_LOAD_ERROR||T===r.ErrorDetails.KEY_LOAD_TIMEOUT?"encryption":"manifest",request_error_code:L==null?void 0:L.code,request_error_text:L==null?void 0:L.text}),I){var z,V="".concat(G?"url: ".concat(G,`
`):"")+"".concat(L&&(L.code||L.text)?"response: ".concat(L.code,", ").concat(L.text,`
`):"")+"".concat(A.reason?"failure reason: ".concat(A.reason,`
`):"")+"".concat(A.level?"level: ".concat(A.level,`
`):"")+"".concat(A.parent?"parent stream controller: ".concat(A.parent,`
`):"")+"".concat(A.buffer?"buffer length: ".concat(A.buffer,`
`):"")+"".concat(A.error?"error: ".concat(A.error,`
`):"")+"".concat(A.event?"event: ".concat(A.event,`
`):"")+"".concat(A.err?"error message: ".concat((z=A.err)===null||z===void 0?void 0:z.message,`
`):"");l("error",{player_error_code:E,player_error_message:T,player_error_context:V})}};i.on(r.Events.ERROR,m);var _=function(g,A){var E=A.frag,T=E&&E._url||"";l("requestcanceled",{request_event_type:g,request_url:T,request_type:"media",request_hostname:Ct(T)})};i.on(r.Events.FRAG_LOAD_EMERGENCY_ABORTED,_);var y=function(g,A){var E=A.level,T=i.levels[E];if(T&&T.attrs&&T.attrs.BANDWIDTH){var L=T.attrs.BANDWIDTH,I,S=parseFloat(T.attrs["FRAME-RATE"]);isNaN(S)||(I=S),L?l("renditionchange",{video_source_fps:I,video_source_bitrate:L,video_source_width:T.width,video_source_height:T.height,video_source_rendition_name:T.name,video_source_codec:T==null?void 0:T.videoCodec}):n.warn("missing BANDWIDTH from HLS manifest parsed by HLS.js")}};i.on(r.Events.LEVEL_SWITCHED,y),i._stopMuxMonitor=function(){i.off(r.Events.MANIFEST_LOADED,c),i.off(r.Events.LEVEL_LOADED,p),i.off(r.Events.AUDIO_TRACK_LOADED,v),i.off(r.Events.FRAG_LOADED,d),i.off(r.Events.FRAG_CHANGED,u),i.off(r.Events.ERROR,m),i.off(r.Events.FRAG_LOAD_EMERGENCY_ABORTED,_),i.off(r.Events.LEVEL_SWITCHED,y),i.off(r.Events.DESTROYING,i._stopMuxMonitor),delete i._stopMuxMonitor},i.on(r.Events.DESTROYING,i._stopMuxMonitor)},EE=function(e){e&&typeof e._stopMuxMonitor=="function"&&e._stopMuxMonitor()},Vh=function(e,t){if(!e||!e.requestEndDate)return{};var i=Ct(e.url),a=e.url,r=e.bytesLoaded,n=new Date(e.requestStartDate).getTime(),s=new Date(e.firstByteDate).getTime(),o=new Date(e.requestEndDate).getTime(),l=isNaN(e.duration)?0:e.duration,c=typeof t.getMetricsFor=="function"?t.getMetricsFor(e.mediaType).HttpList:t.getDashMetrics().getHttpRequests(e.mediaType),p;c.length>0&&(p=cd(c[c.length-1]._responseHeaders||""));var v=p?Es(p):void 0;return{requestStart:n,requestResponseStart:s,requestResponseEnd:o,requestBytesLoaded:r,requestResponseHeaders:p,requestMediaDuration:l,requestHostname:i,requestUrl:a,requestId:v}},bE=function(e,t){if(typeof t.getCurrentRepresentationForType=="function"){var i=t.getCurrentRepresentationForType(e);return i?{currentLevel:i.absoluteIndex,renditionWidth:i.width||null,renditionHeight:i.height||null,renditionBitrate:i.bandwidth}:{}}var a=t.getQualityFor(e),r=t.getCurrentTrackFor(e).bitrateList;return r?{currentLevel:a,renditionWidth:r[a].width||null,renditionHeight:r[a].height||null,renditionBitrate:r[a].bandwidth}:{}},gE=function(e){var t;return(t=e.match(/.*codecs\*?="(.*)"/))===null||t===void 0?void 0:t[1]},yE=function(e){try{var t,i,a=(i=e.getVersion)===null||i===void 0||(t=i.call(e))===null||t===void 0?void 0:t.split(".").map(function(r){return parseInt(r)})[0];return a}catch(r){return!1}},TE=function(e,t,i){var a=arguments.length>3&&arguments[3]!==void 0?arguments[3]:{},r=e.log;if(!i||!i.on){r.warn("Invalid dash.js player reference. Monitoring blocked.");return}var n=yE(i),s=function(E,T){return e.emit(t,E,T)},o=function(E){var T=E.type,L=E.data,I=(L||{}).url;s("requestcompleted",{request_event_type:T,request_start:0,request_response_start:0,request_response_end:0,request_bytes_loaded:-1,request_type:"manifest",request_hostname:Ct(I),request_url:I})};i.on("manifestLoaded",o);var l={},c=function(E){if(typeof E.getRequests!="function")return null;var T=E.getRequests({state:"executed"});return T.length===0?null:T[T.length-1]},p=function(E){var T=E.type,L=E.fragmentModel,I=E.chunk,S=c(L);v({type:T,request:S,chunk:I})},v=function(E){var T=E.type,L=E.chunk,I=E.request,S=(L||{}).mediaInfo,H=S||{},G=H.type,ne=H.bitrateList;ne=ne||[];var z={};ne.forEach(function(pt,Be){z[Be]={},z[Be].width=pt.width,z[Be].height=pt.height,z[Be].bitrate=pt.bandwidth,z[Be].attrs={}}),G==="video"?l.video=z:G==="audio"?l.audio=z:l.media=z;var V=Vh(I,i),ze=V.requestStart,ht=V.requestResponseStart,mt=V.requestResponseEnd,De=V.requestResponseHeaders,ot=V.requestMediaDuration,et=V.requestHostname,Kt=V.requestUrl,$t=V.requestId;s("requestcompleted",{request_event_type:T,request_start:ze,request_response_start:ht,request_response_end:mt,request_bytes_loaded:-1,request_type:G+"_init",request_response_headers:De,request_hostname:et,request_id:$t,request_url:Kt,request_media_duration:ot,request_rendition_lists:l})};n>=4?i.on("initFragmentLoaded",v):i.on("initFragmentLoaded",p);var d=function(E){var T=E.type,L=E.fragmentModel,I=E.chunk,S=c(L);u({type:T,request:S,chunk:I})},u=function(E){var T=E.type,L=E.chunk,I=E.request,S=L||{},H=S.mediaInfo,G=S.start,ne=H||{},z=ne.type,V=Vh(I,i),ze=V.requestStart,ht=V.requestResponseStart,mt=V.requestResponseEnd,De=V.requestBytesLoaded,ot=V.requestResponseHeaders,et=V.requestMediaDuration,Kt=V.requestHostname,$t=V.requestUrl,pt=V.requestId,Be=bE(z,i),Qe=Be.currentLevel,tt=Be.renditionWidth,Pi=Be.renditionHeight,Ba=Be.renditionBitrate;s("requestcompleted",{request_event_type:T,request_start:ze,request_response_start:ht,request_response_end:mt,request_bytes_loaded:De,request_type:z,request_response_headers:ot,request_hostname:Kt,request_id:pt,request_url:$t,request_media_start_time:G,request_media_duration:et,request_current_level:Qe,request_labeled_bitrate:Ba,request_video_width:tt,request_video_height:Pi})};n>=4?i.on("mediaFragmentLoaded",u):i.on("mediaFragmentLoaded",d);var m={video:void 0,audio:void 0,totalBitrate:void 0},_=function(){if(m.video&&typeof m.video.bitrate=="number"){if(!(m.video.width&&m.video.height)){r.warn("have bitrate info for video but missing width/height");return}var E=m.video.bitrate;if(m.audio&&typeof m.audio.bitrate=="number"&&(E+=m.audio.bitrate),E!==m.totalBitrate)return m.totalBitrate=E,{video_source_bitrate:E,video_source_height:m.video.height,video_source_width:m.video.width,video_source_codec:gE(m.video.codec)}}},y=function(E,T,L){var I=E.mediaType;if(I==="audio"||I==="video"){var S;if(typeof i.getRepresentationsByType=="function")if(E.newRepresentation)S={bitrate:E.newRepresentation.bandwidth,width:E.newRepresentation.width,height:E.newRepresentation.height,qualityIndex:E.newRepresentation.absoluteIndex};else{var H=i.getRepresentationsByType(I);if(H&&typeof E.newQuality=="number"){var G=H.find(function(z){return z.absoluteIndex===E.newQuality||z.index===E.newQuality});G&&(S={bitrate:G.bandwidth,width:G.width,height:G.height,qualityIndex:E.newQuality})}}else{if(typeof E.newQuality!="number"){r.warn("missing evt.newQuality in qualityChangeRendered event",E);return}S=i.getBitrateInfoListFor(I).find(function(z){var V=z.qualityIndex;return V===E.newQuality})}if(!(S&&typeof S.bitrate=="number")){r.warn("missing bitrate info for ".concat(I));return}m[I]=ud(Jr({},S),{codec:i.getCurrentTrackFor(I).codec});var ne=_();ne&&s("renditionchange",ne)}};i.on("qualityChangeRendered",y);var g=function(E){var T=E.request,L=E.mediaType;T=T||{},s("requestcanceled",{request_event_type:T.type+"_"+T.action,request_url:T.url,request_type:L,request_hostname:Ct(T.url)})};i.on("fragmentLoadingAbandoned",g);var A=function(E){var T=E.error,L,I,S=(T==null||(L=T.data)===null||L===void 0?void 0:L.request)||{},H=(T==null||(I=T.data)===null||I===void 0?void 0:I.response)||{};(T==null?void 0:T.code)===27&&s("requestfailed",{request_error:S.type+"_"+S.action,request_url:S.url,request_hostname:Ct(S.url),request_type:S.mediaType,request_error_code:H.status,request_error_text:H.statusText});var G="".concat(S!=null&&S.url?"url: ".concat(S.url,`
`):"")+"".concat(H!=null&&H.status||H!=null&&H.statusText?"response: ".concat(H==null?void 0:H.status,", ").concat(H==null?void 0:H.statusText,`
`):"");s("error",{player_error_code:T==null?void 0:T.code,player_error_message:T==null?void 0:T.message,player_error_context:G})};i.on("error",A),i._stopMuxMonitor=function(){i.off("manifestLoaded",o),i.off("initFragmentLoaded",v),i.off("mediaFragmentLoaded",u),i.off("qualityChangeRendered",y),i.off("error",A),i.off("fragmentLoadingAbandoned",g),delete i._stopMuxMonitor}},AE=function(e){e&&typeof e._stopMuxMonitor=="function"&&e._stopMuxMonitor()},qh=0,kE=(function(){"use strict";function e(){ke(this,e),C(this,"_listeners",void 0)}return ft(e,[{key:"on",value:function(t,i,a){return i._eventEmitterGuid=i._eventEmitterGuid||++qh,this._listeners=this._listeners||{},this._listeners[t]=this._listeners[t]||[],a&&(i=i.bind(a)),this._listeners[t].push(i),i}},{key:"off",value:function(t,i){var a=this._listeners&&this._listeners[t];a&&a.forEach(function(r,n){r._eventEmitterGuid===i._eventEmitterGuid&&a.splice(n,1)})}},{key:"one",value:function(t,i,a){var r=this;i._eventEmitterGuid=i._eventEmitterGuid||++qh;var n=function(){r.off(t,n),i.apply(a||this,arguments)};n._eventEmitterGuid=i._eventEmitterGuid,this.on(t,n)}},{key:"emit",value:function(t,i){var a=this;if(this._listeners){i=i||{};var r=this._listeners["before"+t]||[],n=this._listeners["before*"]||[],s=this._listeners[t]||[],o=this._listeners["after"+t]||[],l=function(c,p){c=c.slice(),c.forEach(function(v){v.call(a,{type:t},p)})};l(r,i),l(n,i),l(s,i),l(o,i)}}}]),e})(),wE=kE,hd=_t(qt()),SE=(function(){"use strict";function e(t){var i=this;ke(this,e),C(this,"_playbackHeartbeatInterval",void 0),C(this,"_playheadShouldBeProgressing",void 0),C(this,"pm",void 0),this.pm=t,this._playbackHeartbeatInterval=null,this._playheadShouldBeProgressing=!1,t.on("playing",function(){i._playheadShouldBeProgressing=!0}),t.on("play",this._startPlaybackHeartbeatInterval.bind(this)),t.on("playing",this._startPlaybackHeartbeatInterval.bind(this)),t.on("adbreakstart",this._startPlaybackHeartbeatInterval.bind(this)),t.on("adplay",this._startPlaybackHeartbeatInterval.bind(this)),t.on("adplaying",this._startPlaybackHeartbeatInterval.bind(this)),t.on("devicewake",this._startPlaybackHeartbeatInterval.bind(this)),t.on("viewstart",this._startPlaybackHeartbeatInterval.bind(this)),t.on("rebufferstart",this._startPlaybackHeartbeatInterval.bind(this)),t.on("pause",this._stopPlaybackHeartbeatInterval.bind(this)),t.on("ended",this._stopPlaybackHeartbeatInterval.bind(this)),t.on("viewend",this._stopPlaybackHeartbeatInterval.bind(this)),t.on("error",this._stopPlaybackHeartbeatInterval.bind(this)),t.on("aderror",this._stopPlaybackHeartbeatInterval.bind(this)),t.on("adpause",this._stopPlaybackHeartbeatInterval.bind(this)),t.on("adended",this._stopPlaybackHeartbeatInterval.bind(this)),t.on("adbreakend",this._stopPlaybackHeartbeatInterval.bind(this)),t.on("seeked",function(){t.data.player_is_paused?i._stopPlaybackHeartbeatInterval():i._startPlaybackHeartbeatInterval()}),t.on("timeupdate",function(){i._playbackHeartbeatInterval!==null&&t.emit("playbackheartbeat")}),t.on("devicesleep",function(a,r){i._playbackHeartbeatInterval!==null&&(hd.default.clearInterval(i._playbackHeartbeatInterval),t.emit("playbackheartbeatend",{viewer_time:r.viewer_time}),i._playbackHeartbeatInterval=null)})}return ft(e,[{key:"_startPlaybackHeartbeatInterval",value:function(){var t=this;this._playbackHeartbeatInterval===null&&(this.pm.emit("playbackheartbeat"),this._playbackHeartbeatInterval=hd.default.setInterval(function(){t.pm.emit("playbackheartbeat")},this.pm.playbackHeartbeatTime))}},{key:"_stopPlaybackHeartbeatInterval",value:function(){this._playheadShouldBeProgressing=!1,this._playbackHeartbeatInterval!==null&&(hd.default.clearInterval(this._playbackHeartbeatInterval),this.pm.emit("playbackheartbeatend"),this._playbackHeartbeatInterval=null)}}]),e})(),IE=SE,RE=function e(t){"use strict";var i=this;ke(this,e),C(this,"viewErrored",void 0),t.on("viewinit",function(){i.viewErrored=!1}),t.on("error",function(a,r){try{var n=t.errorTranslator({player_error_code:r.player_error_code,player_error_message:r.player_error_message,player_error_context:r.player_error_context,player_error_severity:r.player_error_severity,player_error_business_exception:r.player_error_business_exception});n&&(t.data.player_error_code=n.player_error_code||r.player_error_code,t.data.player_error_message=n.player_error_message||r.player_error_message,t.data.player_error_context=n.player_error_context||r.player_error_context,t.data.player_error_severity=n.player_error_severity||r.player_error_severity,t.data.player_error_business_exception=n.player_error_business_exception||r.player_error_business_exception,i.viewErrored=!0)}catch(s){t.mux.log.warn("Exception in error translator callback.",s),i.viewErrored=!0}}),t.on("aftererror",function(){var a,r,n,s,o;(a=t.data)===null||a===void 0||delete a.player_error_code,(r=t.data)===null||r===void 0||delete r.player_error_message,(n=t.data)===null||n===void 0||delete n.player_error_context,(s=t.data)===null||s===void 0||delete s.player_error_severity,(o=t.data)===null||o===void 0||delete o.player_error_business_exception})},LE=RE,CE=(function(){"use strict";function e(t){ke(this,e),C(this,"_watchTimeTrackerLastCheckedTime",void 0),C(this,"pm",void 0),this.pm=t,this._watchTimeTrackerLastCheckedTime=null,t.on("playbackheartbeat",this._updateWatchTime.bind(this)),t.on("playbackheartbeatend",this._clearWatchTimeState.bind(this))}return ft(e,[{key:"_updateWatchTime",value:function(t,i){var a=i.viewer_time;this._watchTimeTrackerLastCheckedTime===null&&(this._watchTimeTrackerLastCheckedTime=a),Oe(this.pm.data,"view_watch_time",a-this._watchTimeTrackerLastCheckedTime),this._watchTimeTrackerLastCheckedTime=a}},{key:"_clearWatchTimeState",value:function(t,i){this._updateWatchTime(t,i),this._watchTimeTrackerLastCheckedTime=null}}]),e})(),ME=CE,DE=(function(){"use strict";function e(t){var i=this;ke(this,e),C(this,"_playbackTimeTrackerLastPlayheadPosition",void 0),C(this,"_lastTime",void 0),C(this,"_isAdPlaying",void 0),C(this,"_callbackUpdatePlaybackTime",void 0),C(this,"pm",void 0),this.pm=t,this._playbackTimeTrackerLastPlayheadPosition=-1,this._lastTime=He.now(),this._isAdPlaying=!1,this._callbackUpdatePlaybackTime=null,t.on("viewinit",function(){i.pm.data.view_playing_time_ms_cumulative=0});var a=this._startPlaybackTimeTracking.bind(this);t.on("playing",a),t.on("adplaying",a);var r=function(){i.pm.data.player_is_paused||a()};t.on("seeked",r),t.on("rebufferend",r);var n=this._stopPlaybackTimeTracking.bind(this);t.on("playbackheartbeatend",n),t.on("seeking",n),t.on("rebufferstart",n),t.on("adplaying",function(){i._isAdPlaying=!0}),t.on("adended",function(){i._isAdPlaying=!1}),t.on("adpause",function(){i._isAdPlaying=!1}),t.on("adbreakstart",function(){i._isAdPlaying=!1}),t.on("adbreakend",function(){i._isAdPlaying=!1}),t.on("adplay",function(){i._isAdPlaying=!1}),t.on("viewinit",function(){i._playbackTimeTrackerLastPlayheadPosition=-1,i._lastTime=He.now(),i._isAdPlaying=!1,i._callbackUpdatePlaybackTime=null})}return ft(e,[{key:"_startPlaybackTimeTracking",value:function(){this._callbackUpdatePlaybackTime===null&&(this._callbackUpdatePlaybackTime=this._updatePlaybackTime.bind(this),this._playbackTimeTrackerLastPlayheadPosition=this.pm.data.player_playhead_time,this._lastTime=He.now(),this.pm.on("playbackheartbeat",this._callbackUpdatePlaybackTime))}},{key:"_stopPlaybackTimeTracking",value:function(){this._callbackUpdatePlaybackTime&&(this._updatePlaybackTime(),this.pm.off("playbackheartbeat",this._callbackUpdatePlaybackTime),this._callbackUpdatePlaybackTime=null,this._playbackTimeTrackerLastPlayheadPosition=-1)}},{key:"_updatePlaybackTime",value:function(){var t=this.pm.data.player_playhead_time||0,i=He.now(),a=i-this._lastTime,r=-1;this._playbackTimeTrackerLastPlayheadPosition>=0&&t>this._playbackTimeTrackerLastPlayheadPosition?r=t-this._playbackTimeTrackerLastPlayheadPosition:this._isAdPlaying&&(r=a),r>0&&r<=1e3&&Oe(this.pm.data,"view_content_playback_time",r),this._callbackUpdatePlaybackTime!==null&&a>0&&a<=1e3&&(this._isAdPlaying&&Oe(this.pm.data,"ad_playing_time_ms_cumulative",a),Oe(this.pm.data,"view_playing_time_ms_cumulative",a)),this._playbackTimeTrackerLastPlayheadPosition=t,this._lastTime=i}}]),e})(),xE=DE,OE=(function(){"use strict";function e(t){ke(this,e),C(this,"pm",void 0),this.pm=t;var i=this._updatePlayheadTime.bind(this);t.on("playbackheartbeat",i),t.on("playbackheartbeatend",i),t.on("timeupdate",i),t.on("destroy",function(){t.off("timeupdate",i)})}return ft(e,[{key:"_updateMaxPlayheadPosition",value:function(){this.pm.data.view_max_playhead_position=typeof this.pm.data.view_max_playhead_position=="undefined"?this.pm.data.player_playhead_time:Math.max(this.pm.data.view_max_playhead_position,this.pm.data.player_playhead_time)}},{key:"_updatePlayheadTime",value:function(t,i){var a=this,r=function(){a.pm.currentFragmentPDT&&a.pm.currentFragmentStart&&(a.pm.data.player_program_time=a.pm.currentFragmentPDT+a.pm.data.player_playhead_time-a.pm.currentFragmentStart)};if(i&&i.player_playhead_time)this.pm.data.player_playhead_time=i.player_playhead_time,r(),this._updateMaxPlayheadPosition();else if(this.pm.getPlayheadTime){var n=this.pm.getPlayheadTime();typeof n!="undefined"&&(this.pm.data.player_playhead_time=n,r(),this._updateMaxPlayheadPosition())}}}]),e})(),NE=OE,Yh=300*1e3,PE=function e(t){"use strict";if(ke(this,e),!t.disableRebufferTracking){var i,a=function(n,s){r(s),i=void 0},r=function(n){if(i){var s=n.viewer_time-i;Oe(t.data,"view_rebuffer_duration",s),i=n.viewer_time,t.data.view_rebuffer_duration>Yh&&(t.emit("viewend"),t.send("viewend"),t.mux.log.warn("Ending view after rebuffering for longer than ".concat(Yh,"ms, future events will be ignored unless a programchange or videochange occurs.")))}t.data.view_watch_time>=0&&t.data.view_rebuffer_count>0&&(t.data.view_rebuffer_frequency=t.data.view_rebuffer_count/t.data.view_watch_time,t.data.view_rebuffer_percentage=t.data.view_rebuffer_duration/t.data.view_watch_time)};t.on("playbackheartbeat",function(n,s){return r(s)}),t.on("rebufferstart",function(n,s){i||(Oe(t.data,"view_rebuffer_count",1),i=s.viewer_time,t.one("rebufferend",a))}),t.on("viewinit",function(){i=void 0,t.off("rebufferend",a)})}},UE=PE,BE=(function(){"use strict";function e(t){var i=this;ke(this,e),C(this,"_lastCheckedTime",void 0),C(this,"_lastPlayheadTime",void 0),C(this,"_lastPlayheadTimeUpdatedTime",void 0),C(this,"_rebuffering",void 0),C(this,"pm",void 0),this.pm=t,!(t.disableRebufferTracking||t.disablePlayheadRebufferTracking)&&(this._lastCheckedTime=null,this._lastPlayheadTime=null,this._lastPlayheadTimeUpdatedTime=null,t.on("playbackheartbeat",this._checkIfRebuffering.bind(this)),t.on("playbackheartbeatend",this._cleanupRebufferTracker.bind(this)),t.on("seeking",function(){i._cleanupRebufferTracker(null,{viewer_time:He.now()})}))}return ft(e,[{key:"_checkIfRebuffering",value:function(t,i){if(this.pm.seekingTracker.isSeeking||this.pm.adTracker.isAdBreak||!this.pm.playbackHeartbeat._playheadShouldBeProgressing){this._cleanupRebufferTracker(t,i);return}if(this._lastCheckedTime===null){this._prepareRebufferTrackerState(i.viewer_time);return}if(this._lastPlayheadTime!==this.pm.data.player_playhead_time){this._cleanupRebufferTracker(t,i,!0);return}var a=i.viewer_time-this._lastPlayheadTimeUpdatedTime;typeof this.pm.sustainedRebufferThreshold=="number"&&a>=this.pm.sustainedRebufferThreshold&&(this._rebuffering||(this._rebuffering=!0,this.pm.emit("rebufferstart",{viewer_time:this._lastPlayheadTimeUpdatedTime}))),this._lastCheckedTime=i.viewer_time}},{key:"_clearRebufferTrackerState",value:function(){this._lastCheckedTime=null,this._lastPlayheadTime=null,this._lastPlayheadTimeUpdatedTime=null}},{key:"_prepareRebufferTrackerState",value:function(t){this._lastCheckedTime=t,this._lastPlayheadTime=this.pm.data.player_playhead_time,this._lastPlayheadTimeUpdatedTime=t}},{key:"_cleanupRebufferTracker",value:function(t,i){var a=arguments.length>2&&arguments[2]!==void 0?arguments[2]:!1;if(this._rebuffering)this._rebuffering=!1,this.pm.emit("rebufferend",{viewer_time:i.viewer_time});else{if(this._lastCheckedTime===null)return;var r=this.pm.data.player_playhead_time-this._lastPlayheadTime,n=i.viewer_time-this._lastPlayheadTimeUpdatedTime;typeof this.pm.minimumRebufferDuration=="number"&&r>0&&n-r>this.pm.minimumRebufferDuration&&(this._lastCheckedTime=null,this.pm.emit("rebufferstart",{viewer_time:this._lastPlayheadTimeUpdatedTime}),this.pm.emit("rebufferend",{viewer_time:this._lastPlayheadTimeUpdatedTime+n-r}))}a?this._prepareRebufferTrackerState(i.viewer_time):this._clearRebufferTrackerState()}}]),e})(),HE=BE,WE=(function(){"use strict";function e(t){var i=this;ke(this,e),C(this,"pm",void 0),this.pm=t,t.on("viewinit",function(){var a=t.data,r=a.view_id;if(!a.view_program_changed){var n=function(s,o){var l=o.viewer_time;(s.type==="playing"&&typeof t.data.view_time_to_first_frame=="undefined"||s.type==="adplaying"&&(typeof t.data.view_time_to_first_frame=="undefined"||i._inPrerollPosition()))&&i.calculateTimeToFirstFrame(l||He.now(),r)};t.one("playing",n),t.one("adplaying",n),t.one("viewend",function(){t.off("playing",n),t.off("adplaying",n)})}})}return ft(e,[{key:"_inPrerollPosition",value:function(){return typeof this.pm.data.view_content_playback_time=="undefined"||this.pm.data.view_content_playback_time<=1e3}},{key:"calculateTimeToFirstFrame",value:function(t,i){i===this.pm.data.view_id&&(this.pm.watchTimeTracker._updateWatchTime(null,{viewer_time:t}),this.pm.data.view_time_to_first_frame=this.pm.data.view_watch_time,(this.pm.data.player_autoplay_on||this.pm.data.video_is_autoplay)&&this.pm.pageLoadInitTime&&(this.pm.data.view_aggregate_startup_time=this.pm.data.view_start+this.pm.data.view_watch_time-this.pm.pageLoadInitTime))}}]),e})(),FE=WE,KE=function e(t){"use strict";var i=this;ke(this,e),C(this,"_lastPlayerHeight",void 0),C(this,"_lastPlayerWidth",void 0),C(this,"_lastPlayheadPosition",void 0),C(this,"_lastSourceHeight",void 0),C(this,"_lastSourceWidth",void 0),t.on("viewinit",function(){i._lastPlayheadPosition=-1});var a=["pause","rebufferstart","seeking","error","adbreakstart","hb","renditionchange","orientationchange","viewend","playbackmodechange"],r=["playing","hb","renditionchange","orientationchange","playbackmodechange"];a.forEach(function(n){t.on(n,function(){if(i._lastPlayheadPosition>=0&&t.data.player_playhead_time>=0&&i._lastPlayerWidth>=0&&i._lastSourceWidth>0&&i._lastPlayerHeight>=0&&i._lastSourceHeight>0){var s=t.data.player_playhead_time-i._lastPlayheadPosition;if(s<0){i._lastPlayheadPosition=-1;return}var o=Math.min(i._lastPlayerWidth/i._lastSourceWidth,i._lastPlayerHeight/i._lastSourceHeight),l=Math.max(0,o-1),c=Math.max(0,1-o);t.data.view_max_upscale_percentage=Math.max(t.data.view_max_upscale_percentage||0,l),t.data.view_max_downscale_percentage=Math.max(t.data.view_max_downscale_percentage||0,c),Oe(t.data,"view_total_content_playback_time",s),Oe(t.data,"view_total_upscaling",l*s),Oe(t.data,"view_total_downscaling",c*s)}i._lastPlayheadPosition=-1})}),r.forEach(function(n){t.on(n,function(){i._lastPlayheadPosition=t.data.player_playhead_time,i._lastPlayerWidth=t.data.player_width,i._lastPlayerHeight=t.data.player_height,i._lastSourceWidth=t.data.video_source_width,i._lastSourceHeight=t.data.video_source_height})})},$E=KE,VE=2e3,qE=function e(t){"use strict";var i=this;ke(this,e),C(this,"isSeeking",void 0),this.isSeeking=!1;var a=-1,r=function(){var n=He.now(),s=(t.data.viewer_time||n)-(a||n);Oe(t.data,"view_seek_duration",s),t.data.view_max_seek_time=Math.max(t.data.view_max_seek_time||0,s),i.isSeeking=!1,a=-1};t.on("seeking",function(n,s){if(Object.assign(t.data,s),i.isSeeking&&s.viewer_time-a<=VE){a=s.viewer_time;return}i.isSeeking&&r(),i.isSeeking=!0,a=s.viewer_time,Oe(t.data,"view_seek_count",1),t.send("seeking")}),t.on("seeked",function(){r()}),t.on("viewend",function(){i.isSeeking&&(r(),t.send("seeked")),i.isSeeking=!1,a=-1})},YE=qE,Gh=function(e,t){e.push(t),e.sort(function(i,a){return i.viewer_time-a.viewer_time})},GE=["adbreakstart","adrequest","adresponse","adplay","adplaying","adpause","adended","adbreakend","aderror","adclicked","adskipped"],zE=(function(){"use strict";function e(t){var i=this;ke(this,e),C(this,"_adHasPlayed",void 0),C(this,"_adRequests",void 0),C(this,"_adResponses",void 0),C(this,"_currentAdRequestNumber",void 0),C(this,"_currentAdResponseNumber",void 0),C(this,"_prerollPlayTime",void 0),C(this,"_wouldBeNewAdPlay",void 0),C(this,"isAdBreak",void 0),C(this,"pm",void 0),this.pm=t,t.on("viewinit",function(){i.isAdBreak=!1,i._currentAdRequestNumber=0,i._currentAdResponseNumber=0,i._adRequests=[],i._adResponses=[],i._adHasPlayed=!1,i._wouldBeNewAdPlay=!0,i._prerollPlayTime=void 0}),GE.forEach(function(r){return t.on(r,i._updateAdData.bind(i))});var a=function(){i.isAdBreak=!1};t.on("adbreakstart",function(){i.isAdBreak=!0}),t.on("play",a),t.on("playing",a),t.on("viewend",a),t.on("adrequest",function(r,n){n=Object.assign({ad_request_id:"generatedAdRequestId"+i._currentAdRequestNumber++},n),Gh(i._adRequests,n),Oe(t.data,"view_ad_request_count"),i.inPrerollPosition()&&(t.data.view_preroll_requested=!0,i._adHasPlayed||Oe(t.data,"view_preroll_request_count"))}),t.on("adresponse",function(r,n){n=Object.assign({ad_request_id:"generatedAdRequestId"+i._currentAdResponseNumber++},n),Gh(i._adResponses,n);var s=i.findAdRequest(n.ad_request_id);s&&Oe(t.data,"view_ad_request_time",Math.max(0,n.viewer_time-s.viewer_time))}),t.on("adplay",function(r,n){i._adHasPlayed=!0,i._wouldBeNewAdPlay&&(i._wouldBeNewAdPlay=!1,Oe(t.data,"view_ad_played_count")),i.inPrerollPosition()&&!t.data.view_preroll_played&&(t.data.view_preroll_played=!0,i._adRequests.length>0&&(t.data.view_preroll_request_time=Math.max(0,n.viewer_time-i._adRequests[0].viewer_time)),t.data.view_start&&(t.data.view_startup_preroll_request_time=Math.max(0,n.viewer_time-t.data.view_start)),i._prerollPlayTime=n.viewer_time)}),t.on("adplaying",function(r,n){i.inPrerollPosition()&&typeof t.data.view_preroll_load_time=="undefined"&&typeof i._prerollPlayTime!="undefined"&&(t.data.view_preroll_load_time=n.viewer_time-i._prerollPlayTime,t.data.view_startup_preroll_load_time=n.viewer_time-i._prerollPlayTime)}),t.on("adclicked",function(r,n){i._wouldBeNewAdPlay||Oe(t.data,"view_ad_clicked_count")}),t.on("adskipped",function(r,n){i._wouldBeNewAdPlay||Oe(t.data,"view_ad_skipped_count")}),t.on("adended",function(){i._wouldBeNewAdPlay=!0}),t.on("aderror",function(){i._wouldBeNewAdPlay=!0})}return ft(e,[{key:"inPrerollPosition",value:function(){return typeof this.pm.data.view_content_playback_time=="undefined"||this.pm.data.view_content_playback_time<=1e3}},{key:"findAdRequest",value:function(t){for(var i=0;i<this._adRequests.length;i++)if(this._adRequests[i].ad_request_id===t)return this._adRequests[i]}},{key:"_updateAdData",value:function(t,i){if(this.inPrerollPosition()){if(!this.pm.data.view_preroll_ad_tag_hostname&&i.ad_tag_url){var a=fi(Xr(i.ad_tag_url),2),r=a[0],n=a[1];this.pm.data.view_preroll_ad_tag_domain=n,this.pm.data.view_preroll_ad_tag_hostname=r}if(!this.pm.data.view_preroll_ad_asset_hostname&&i.ad_asset_url){var s=fi(Xr(i.ad_asset_url),2),o=s[0],l=s[1];this.pm.data.view_preroll_ad_asset_domain=l,this.pm.data.view_preroll_ad_asset_hostname=o}this.pm.data.ad_type="preroll"}this.pm.data.ad_asset_url=i==null?void 0:i.ad_asset_url,this.pm.data.ad_tag_url=i==null?void 0:i.ad_tag_url,this.pm.data.ad_creative_id=i==null?void 0:i.ad_creative_id,this.pm.data.ad_id=i==null?void 0:i.ad_id,this.pm.data.ad_universal_id=i==null?void 0:i.ad_universal_id,i!=null&&i.ad_type&&(this.pm.data.ad_type=i==null?void 0:i.ad_type)}}]),e})(),QE=zE,ZE=function e(t){"use strict";var i=this;ke(this,e),C(this,"lastWallClockTime",void 0);var a=function(){i.lastWallClockTime=He.now(),t.on("before*",r)},r=function(n){var s=He.now(),o=i.lastWallClockTime;i.lastWallClockTime=s,s-o>3e4&&(t.emit("devicesleep",{viewer_time:o}),Object.assign(t.data,{viewer_time:o}),t.send("devicesleep"),t.emit("devicewake",{viewer_time:s}),Object.assign(t.data,{viewer_time:s}),t.send("devicewake"))};t.one("playbackheartbeat",a),t.on("playbackheartbeatend",function(){t.off("before*",r),t.one("playbackheartbeat",a)})},jE=ZE,md=_t(qt()),zh=(function(e){return e()})(function(){var e=function(){for(var i=0,a={};i<arguments.length;i++){var r=arguments[i];for(var n in r)a[n]=r[n]}return a};function t(i){function a(r,n,s){var o;if(typeof document!="undefined"){if(arguments.length>1){if(s=e({path:"/"},a.defaults,s),typeof s.expires=="number"){var l=new Date;l.setMilliseconds(l.getMilliseconds()+s.expires*864e5),s.expires=l}try{o=JSON.stringify(n),/^[\{\[]/.test(o)&&(n=o)}catch(_){}return i.write?n=i.write(n,r):n=encodeURIComponent(String(n)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,decodeURIComponent),r=encodeURIComponent(String(r)),r=r.replace(/%(23|24|26|2B|5E|60|7C)/g,decodeURIComponent),r=r.replace(/[\(\)]/g,escape),document.cookie=[r,"=",n,s.expires?"; expires="+s.expires.toUTCString():"",s.path?"; path="+s.path:"",s.domain?"; domain="+s.domain:"",s.secure?"; secure":""].join("")}r||(o={});for(var c=document.cookie?document.cookie.split("; "):[],p=/(%[0-9A-Z]{2})+/g,v=0;v<c.length;v++){var d=c[v].split("="),u=d.slice(1).join("=");u.charAt(0)==='"'&&(u=u.slice(1,-1));try{var m=d[0].replace(p,decodeURIComponent);if(u=i.read?i.read(u,m):i(u,m)||u.replace(p,decodeURIComponent),this.json)try{u=JSON.parse(u)}catch(_){}if(r===m){o=u;break}r||(o[m]=u)}catch(_){}}return o}}return a.set=a,a.get=function(r){return a.call(a,r)},a.getJSON=function(){return a.apply({json:!0},[].slice.call(arguments))},a.defaults={},a.remove=function(r,n){a(r,"",e(n,{expires:-1}))},a.withConverter=t,a}return t(function(){})}),Qh="muxData",XE=function(e){return Object.entries(e).map(function(t){var i=fi(t,2),a=i[0],r=i[1];return"".concat(a,"=").concat(r)}).join("&")},JE=function(e){return e.split("&").reduce(function(t,i){var a=fi(i.split("="),2),r=a[0],n=a[1],s=+n,o=n&&s==n?s:n;return t[r]=o,t},{})},Zh=function(){var e;try{e=JE(zh.get(Qh)||"")}catch(t){e={}}return e},jh=function(e){try{zh.set(Qh,XE(e),{expires:365})}catch(t){}},eb=function(){var e=Zh();return e.mux_viewer_id=e.mux_viewer_id||jr(),e.msn=e.msn||Math.random(),jh(e),{mux_viewer_id:e.mux_viewer_id,mux_sample_number:e.msn}},tb=function(){var e=Zh(),t=He.now();return e.session_start&&(e.sst=e.session_start,delete e.session_start),e.session_id&&(e.sid=e.session_id,delete e.session_id),e.session_expires&&(e.sex=e.session_expires,delete e.session_expires),(!e.sex||e.sex<t)&&(e.sid=jr(),e.sst=t),e.sex=t+1500*1e3,jh(e),{session_id:e.sid,session_start:e.sst,session_expires:e.sex}};function ib(e,t){var i=t.beaconCollectionDomain,a=t.beaconDomain;if(i){var r=/localhost(?::\d+)?$/.test(i)?"http://":"https://";return r+i}e=e||"inferred";var n=a||"litix.io";return e.match(/^[a-z0-9]+$/)?"https://"+e+"."+n:"https://img.litix.io/a.gif"}var ab={a:"env",b:"beacon",c:"custom",d:"ad",e:"event",f:"experiment",i:"internal",m:"mux",n:"response",p:"player",q:"request",r:"retry",s:"session",t:"timestamp",u:"viewer",v:"video",w:"page",x:"view",y:"sub"},rb=Jh(ab),nb={ad:"ad",af:"affiliate",ag:"aggregate",ap:"api",al:"application",ao:"audio",ar:"architecture",as:"asset",au:"autoplay",av:"average",bi:"bitrate",bn:"brand",br:"break",bw:"browser",by:"bytes",bz:"business",ca:"cached",cb:"cancel",cc:"codec",cd:"code",cg:"category",ch:"changed",ci:"client",ck:"clicked",cl:"canceled",cm:"cmcd",cn:"config",co:"count",ce:"counter",cp:"complete",cq:"creator",cr:"creative",cs:"captions",ct:"content",cu:"current",cv:"cumulative",cx:"connection",cz:"context",da:"data",dg:"downscaling",dm:"domain",dn:"cdn",do:"downscale",dr:"drm",dp:"dropped",du:"duration",dv:"device",dy:"dynamic",eb:"enabled",ec:"encoding",ed:"edge",en:"end",eg:"engine",em:"embed",er:"error",ep:"experiments",es:"errorcode",et:"errortext",ee:"event",ev:"events",ex:"expires",ez:"exception",fa:"failed",fi:"first",fm:"family",ft:"format",fp:"fps",fq:"frequency",fr:"frame",fs:"fullscreen",ha:"has",hb:"holdback",he:"headers",ho:"host",hn:"hostname",ht:"height",id:"id",ii:"init",in:"instance",ip:"ip",is:"is",ke:"key",la:"language",lb:"labeled",le:"level",li:"live",ld:"loaded",lo:"load",lw:"low",ls:"lists",lt:"latency",ma:"max",md:"media",me:"message",mf:"manifest",mi:"mime",ml:"midroll",mm:"min",mn:"manufacturer",mo:"model",mp:"mode",ms:"ms",mx:"mux",ne:"newest",nm:"name",no:"number",on:"on",or:"origin",os:"os",pa:"paused",pb:"playback",pd:"producer",pe:"percentage",pf:"played",pg:"program",ph:"playhead",pi:"plugin",pl:"preroll",pn:"playing",po:"poster",pp:"pip",pr:"preload",ps:"position",pt:"part",pv:"previous",py:"property",px:"pop",pz:"plan",ra:"rate",rd:"requested",re:"rebuffer",rf:"rendition",rg:"range",rm:"remote",ro:"ratio",rp:"response",rq:"request",rs:"requests",sa:"sample",sd:"skipped",se:"session",sh:"shift",sk:"seek",sm:"stream",so:"source",sq:"sequence",sr:"series",ss:"status",st:"start",su:"startup",sv:"server",sw:"software",sy:"severity",ta:"tag",tc:"tech",te:"text",tg:"target",th:"throughput",ti:"time",tl:"total",to:"to",tt:"title",ty:"type",ug:"upscaling",un:"universal",up:"upscale",ur:"url",us:"user",va:"variant",vd:"viewed",vi:"video",ve:"version",vw:"view",vr:"viewer",wd:"width",wa:"watch",wt:"waiting"},Xh=Jh(nb);function Jh(e){var t={};for(var i in e)e.hasOwnProperty(i)&&(t[e[i]]=i);return t}function pd(e){var t={},i={};return Object.keys(e).forEach(function(a){var r=!1;if(e.hasOwnProperty(a)&&e[a]!==void 0){var n=a.split("_"),s=n[0],o=rb[s];o||(ue.info("Data key word `"+n[0]+"` not expected in "+a),o=s+"_"),n.splice(1).forEach(function(l){l==="url"&&(r=!0),Xh[l]?o+=Xh[l]:Number.isInteger(Number(l))?o+=l:(ue.info("Data key word `"+l+"` not expected in "+a),o+="_"+l+"_")}),r?i[o]=e[a]:t[o]=e[a]}}),Object.assign(t,i)}var ma=_t(qt()),sb=_t(Uh()),ob={maxBeaconSize:300,maxQueueLength:3600,baseTimeBetweenBeacons:1e4,maxPayloadKBSize:500},lb=56*1024,db=["hb","requestcompleted","requestfailed","requestcanceled"],ub="https://img.litix.io",Ei=function(e){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};this._beaconUrl=e||ub,this._eventQueue=[],this._postInFlight=!1,this._resendAfterPost=!1,this._failureCount=0,this._sendTimeout=!1,this._options=Object.assign({},ob,t)};Ei.prototype.queueEvent=function(e,t){var i=Object.assign({},t);return this._eventQueue.length<=this._options.maxQueueLength||e==="eventrateexceeded"?(this._eventQueue.push(i),this._sendTimeout||this._startBeaconSending(),this._eventQueue.length<=this._options.maxQueueLength):!1},Ei.prototype.flushEvents=function(){var e=arguments.length>0&&arguments[0]!==void 0?arguments[0]:!1;if(e&&this._eventQueue.length===1){this._eventQueue.pop();return}this._eventQueue.length&&this._sendBeaconQueue(),this._startBeaconSending()},Ei.prototype.destroy=function(){var e=arguments.length>0&&arguments[0]!==void 0?arguments[0]:!1;this.destroyed=!0,e?this._clearBeaconQueue():this.flushEvents(),ma.default.clearTimeout(this._sendTimeout)},Ei.prototype._clearBeaconQueue=function(){var e=this._eventQueue.length>this._options.maxBeaconSize?this._eventQueue.length-this._options.maxBeaconSize:0,t=this._eventQueue.slice(e);e>0&&Object.assign(t[t.length-1],pd({mux_view_message:"event queue truncated"}));var i=this._createPayload(t);em(this._beaconUrl,i,!0,function(){})},Ei.prototype._sendBeaconQueue=function(){var e=this;if(this._postInFlight){this._resendAfterPost=!0;return}var t=this._eventQueue.slice(0,this._options.maxBeaconSize);this._eventQueue=this._eventQueue.slice(this._options.maxBeaconSize),this._postInFlight=!0;var i=this._createPayload(t),a=He.now();em(this._beaconUrl,i,!1,function(r,n){n?(e._eventQueue=t.concat(e._eventQueue),e._failureCount+=1,ue.info("Error sending beacon: "+n)):e._failureCount=0,e._roundTripTime=He.now()-a,e._postInFlight=!1,e._resendAfterPost&&(e._resendAfterPost=!1,e._eventQueue.length>0&&e._sendBeaconQueue())})},Ei.prototype._getNextBeaconTime=function(){if(!this._failureCount)return this._options.baseTimeBetweenBeacons;var e=Math.pow(2,this._failureCount-1);return e=e*Math.random(),(1+e)*this._options.baseTimeBetweenBeacons},Ei.prototype._startBeaconSending=function(){var e=this;ma.default.clearTimeout(this._sendTimeout),!this.destroyed&&(this._sendTimeout=ma.default.setTimeout(function(){e._eventQueue.length&&e._sendBeaconQueue(),e._startBeaconSending()},this._getNextBeaconTime()))},Ei.prototype._createPayload=function(e){var t=this,i={transmission_timestamp:Math.round(He.now())};this._roundTripTime&&(i.rtt_ms=Math.round(this._roundTripTime));var a,r,n,s=function(){a=JSON.stringify({metadata:i,events:r||e}),n=a.length/1024},o=function(){return n<=t._options.maxPayloadKBSize};return s(),o()||(ue.info("Payload size is too big ("+n+" kb). Removing unnecessary events."),r=e.filter(function(l){return db.indexOf(l.e)===-1}),s()),o()||(ue.info("Payload size still too big ("+n+" kb). Cropping fields.."),r.forEach(function(l){for(var c in l){var p=l[c],v=50*1024;typeof p=="string"&&p.length>v&&(l[c]=p.substring(0,v))}}),s()),a};var cb=typeof sb.default.exitPictureInPicture=="function"?function(e){return e.length<=lb}:function(e){return!1},em=function(e,t,i,a){if(i&&navigator&&navigator.sendBeacon&&navigator.sendBeacon(e,t)){a();return}if(ma.default.fetch){ma.default.fetch(e,{method:"POST",body:t,headers:{"Content-Type":"text/plain"},keepalive:cb(t)}).then(function(n){return a(null,n.ok?null:"Error")}).catch(function(n){return a(null,n)});return}if(ma.default.XMLHttpRequest){var r=new ma.default.XMLHttpRequest;r.onreadystatechange=function(){if(r.readyState===4)return a(null,r.status!==200?"error":void 0)},r.open("POST",e),r.setRequestHeader("Content-Type","text/plain"),r.send(t);return}a()},hb=Ei,mb=["env_key","view_id","view_sequence_number","player_sequence_number","beacon_domain","player_playhead_time","viewer_time","mux_api_version","event","video_id","player_instance_id","player_error_code","player_error_message","player_error_context","player_error_severity","player_error_business_exception","view_playing_time_ms_cumulative","ad_playing_time_ms_cumulative"],pb=["adplay","adplaying","adpause","adfirstquartile","admidpoint","adthirdquartile","adended","adresponse","adrequest"],vb=["ad_id","ad_creative_id","ad_universal_id"],_b=["viewstart","error","ended","viewend"],fb=600*1e3,Eb=(function(){"use strict";function e(t,i){var a=arguments.length>2&&arguments[2]!==void 0?arguments[2]:{};ke(this,e);var r,n,s,o,l,c,p,v,d,u,m,_;C(this,"mux",void 0),C(this,"envKey",void 0),C(this,"options",void 0),C(this,"eventQueue",void 0),C(this,"sampleRate",void 0),C(this,"disableCookies",void 0),C(this,"respectDoNotTrack",void 0),C(this,"previousBeaconData",void 0),C(this,"lastEventTime",void 0),C(this,"rateLimited",void 0),C(this,"pageLevelData",void 0),C(this,"viewerData",void 0),this.mux=t,this.envKey=i,this.options=a,this.previousBeaconData=null,this.lastEventTime=0,this.rateLimited=!1,this.eventQueue=new hb(ib(this.envKey,this.options));var y;this.sampleRate=(y=this.options.sampleRate)!==null&&y!==void 0?y:1;var g;this.disableCookies=(g=this.options.disableCookies)!==null&&g!==void 0?g:!1;var A;this.respectDoNotTrack=(A=this.options.respectDoNotTrack)!==null&&A!==void 0?A:!1,this.previousBeaconData=null,this.lastEventTime=0,this.rateLimited=!1,this.pageLevelData={mux_api_version:this.mux.API_VERSION,mux_embed:this.mux.NAME,mux_embed_version:this.mux.VERSION,viewer_application_name:(r=this.options.platform)===null||r===void 0?void 0:r.name,viewer_application_version:(n=this.options.platform)===null||n===void 0?void 0:n.version,viewer_application_engine:(s=this.options.platform)===null||s===void 0?void 0:s.layout,viewer_device_name:(o=this.options.platform)===null||o===void 0?void 0:o.product,viewer_device_category:"",viewer_device_manufacturer:(l=this.options.platform)===null||l===void 0?void 0:l.manufacturer,viewer_os_family:(p=this.options.platform)===null||p===void 0||(c=p.os)===null||c===void 0?void 0:c.family,viewer_os_architecture:(d=this.options.platform)===null||d===void 0||(v=d.os)===null||v===void 0?void 0:v.architecture,viewer_os_version:(m=this.options.platform)===null||m===void 0||(u=m.os)===null||u===void 0?void 0:u.version,page_url:md.default===null||md.default===void 0||(_=md.default.location)===null||_===void 0?void 0:_.href},this.viewerData=this.disableCookies?{}:eb()}return ft(e,[{key:"send",value:function(t,i){if(!(!t||!(i!=null&&i.view_id))){if(this.respectDoNotTrack&&od())return ue.info("Not sending `"+t+"` because Do Not Track is enabled");if(!i||typeof i!="object")return ue.error("A data object was expected in send() but was not provided");var a=this.disableCookies?{}:tb(),r=ud(Jr({},this.pageLevelData,i,a,this.viewerData),{event:t,env_key:this.envKey});r.user_id&&(r.viewer_user_id=r.user_id,delete r.user_id);var n,s=((n=r.mux_sample_number)!==null&&n!==void 0?n:0)>=this.sampleRate,o=this._deduplicateBeaconData(t,r),l=pd(o);if(this.lastEventTime=this.mux.utils.now(),s)return ue.info("Not sending event due to sample rate restriction",t,r,l);if(this.envKey||ue.info("Missing environment key (envKey) - beacons will be dropped if the video source is not a valid mux video URL",t,r,l),!this.rateLimited)if(ue.info("Sending event",t,r,l),this.rateLimited=!this.eventQueue.queueEvent(t,l),this.mux.WINDOW_UNLOADING&&t==="viewend")this.eventQueue.destroy(!0);else{if(this.mux.WINDOW_HIDDEN&&t==="hb")this.eventQueue.flushEvents(!0);else if(_b.indexOf(t)>=0){if(t==="error"&&i.player_error_severity==="warning")return;this.eventQueue.flushEvents()}if(this.rateLimited)return r.event="eventrateexceeded",l=pd(r),this.eventQueue.queueEvent(r.event,l),ue.error("Beaconing disabled due to rate limit.")}}}},{key:"destroy",value:function(){this.eventQueue.destroy(!1)}},{key:"_deduplicateBeaconData",value:function(t,i){var a=this,r={},n=i.view_id;if(n==="-1"||t==="viewstart"||t==="viewend"||!this.previousBeaconData||this.mux.utils.now()-this.lastEventTime>=fb)r=Jr({},i),n&&(this.previousBeaconData=r),n&&t==="viewend"&&(this.previousBeaconData=null);else{var s=t.indexOf("request")===0;Object.entries(i).forEach(function(o){var l=fi(o,2),c=l[0],p=l[1];a.previousBeaconData&&(p!==a.previousBeaconData[c]||mb.indexOf(c)>-1||a.objectHasChanged(s,c,p,a.previousBeaconData[c])||a.eventRequiresKey(t,c))&&(r[c]=p,a.previousBeaconData[c]=p)})}return r}},{key:"objectHasChanged",value:function(t,i,a,r){return!t||i.indexOf("request_")!==0?!1:i==="request_response_headers"||typeof a!="object"||typeof r!="object"?!0:Object.keys(a||{}).length!==Object.keys(r||{}).length}},{key:"eventRequiresKey",value:function(t,i){return!!(t==="renditionchange"&&i.indexOf("video_source_")===0||vb.includes(i)&&pb.includes(t)||t==="playbackmodechange"&&i.indexOf("player_playback_mode")===0)}}]),e})(),bb=function e(t){"use strict";ke(this,e);var i=0,a=0,r=0,n=0,s=0,o=0,l=0,c=function(d,u){var m=u.request_start,_=u.request_response_start,y=u.request_response_end,g=u.request_bytes_loaded;n++;var A,E;if(_?(A=_-(m!=null?m:0),E=(y!=null?y:0)-_):E=(y!=null?y:0)-(m!=null?m:0),E>0&&g&&g>0){var T=g/E*8e3;s++,a+=g,r+=E,t.data.view_min_request_throughput=Math.min(t.data.view_min_request_throughput||1/0,T),t.data.view_average_request_throughput=a/r*8e3,t.data.view_request_count=n,A>0&&(i+=A,t.data.view_max_request_latency=Math.max(t.data.view_max_request_latency||0,A),t.data.view_average_request_latency=i/s)}},p=function(d,u){n++,o++,t.data.view_request_count=n,t.data.view_request_failed_count=o},v=function(d,u){n++,l++,t.data.view_request_count=n,t.data.view_request_canceled_count=l};t.on("requestcompleted",c),t.on("requestfailed",p),t.on("requestcanceled",v)},gb=bb,yb=3600*1e3,Tb=function e(t){"use strict";var i=this;ke(this,e),C(this,"_lastEventTime",void 0),t.on("before*",function(a,r){var n=r.viewer_time,s=He.now(),o=i._lastEventTime;if(i._lastEventTime=s,o&&s-o>yb){var l=Object.keys(t.data).reduce(function(p,v){return v.indexOf("video_")===0?Object.assign(p,C({},v,t.data[v])):p},{});t.mux.log.info("Received event after at least an hour inactivity, creating a new view");var c=t.playbackHeartbeat._playheadShouldBeProgressing;t._resetView(Object.assign({viewer_time:n},l)),t.playbackHeartbeat._playheadShouldBeProgressing=c,t.playbackHeartbeat._playheadShouldBeProgressing&&a.type!=="play"&&a.type!=="adbreakstart"&&(t.emit("play",{viewer_time:n}),a.type!=="playing"&&t.emit("playing",{viewer_time:n}))}})},Ab=Tb,kb=function e(t){"use strict";ke(this,e);var i=function(o){var l=wb(o),c=Sb(o);if(l!=null&&!tm(l,n)&&s<=c){n=l,s=c;var p={video_cdn:l};t.emit("cdnchange",p)}},a=null,r=null,n=null,s=0;t.on("viewinit",function(){a=null,r=null,n=null,s=0}),t.on("beforecdnchange",function(o,l){var c=l==null?void 0:l.video_cdn;c&&(typeof l.video_previous_cdn=="undefined"||l.video_previous_cdn===null)&&(tm(c,r)?l.video_previous_cdn=a!=null?a:void 0:(l.video_previous_cdn=r!=null?r:void 0,a=r,r=c))}),t.on("requestcompleted",function(o,l){i(l)})};function tm(e,t){return(e==null?void 0:e.toLowerCase())===(t==null?void 0:t.toLowerCase())}function wb(e){var t;return e!=null&&e.request_type&&(e.request_type==="media"||e.request_type==="video")&&!((t=e.request_response_headers)===null||t===void 0)&&t["x-cdn"]?e.request_response_headers["x-cdn"]:e!=null&&e.video_cdn?e.video_cdn:null}function Sb(e){return e!=null&&e.request_start?e.request_start:e!=null&&e.viewer_time?e.viewer_time:Date.now()}var Ib=kb,Rb=function(e){try{return JSON.parse(e),!0}catch(t){return!1}},Lb=function e(t){"use strict";var i=this;ke(this,e),C(this,"_emittingAutomaticEvent",!1),C(this,"_hasInitialized",!1),C(this,"_currentMode","standard"),t.on("viewstart",function(){i._hasInitialized||(i._hasInitialized=!0,i._currentMode=t.data.player_playback_mode||"standard",i._emittingAutomaticEvent=!0,t.emit("playbackmodechange",{player_playback_mode:i._currentMode,player_playback_mode_data:"{}"}),i._emittingAutomaticEvent=!1)}),t.on("viewend",function(){i._hasInitialized=!1}),t.on("playbackmodechange",function(a,r){i._emittingAutomaticEvent||(r.player_playback_mode_data?Rb(r.player_playback_mode_data)||(t.mux.log.warn("Invalid JSON string for player_playback_mode_data"),r.player_playback_mode_data="{}"):r.player_playback_mode_data="{}",t.data.player_playback_mode_data=r.player_playback_mode_data,t.data.player_playback_mode=r.player_playback_mode,i._currentMode=r.player_playback_mode)})},Cb=Lb,Mb=(function(){"use strict";function e(t){ke(this,e),C(this,"pm",void 0),C(this,"_currentRangeStart",void 0),C(this,"_lastPlayheadTime",void 0),this.pm=t,this._currentRangeStart=null,this._lastPlayheadTime=null,t.on("playbackheartbeat",this._updatePlaybackRange.bind(this)),t.on("playbackheartbeatend",this._endPlaybackRange.bind(this))}return ft(e,[{key:"_updateLastRangeEnd",value:function(){var t=this.pm.data.video_playback_ranges;if(t&&t.length>0){var i=this.pm.data.player_playhead_time||0;t[t.length-1][1]=i}}},{key:"_updatePlaybackRange",value:function(){var t,i=this.pm.data.player_playhead_time||0;if(!(!this.pm.disableAdPlaybackRangeFiltering&&!((t=this.pm.adTracker)===null||t===void 0)&&t.isAdBreak&&this._lastPlayheadTime!==null&&i<this._lastPlayheadTime)){if(this._lastPlayheadTime!==null&&this._currentRangeStart!==null){var a=Math.abs(i-this._lastPlayheadTime);if(a>1e3){var r=this.pm.data.video_playback_ranges;r&&r.length>0&&(r[r.length-1][1]=this._lastPlayheadTime),this._currentRangeStart=null}}if(this._currentRangeStart===null){var n=this.pm.data.video_playback_ranges||[];n.length>0&&n[n.length-1][1]===i?this._currentRangeStart=n[n.length-1][0]:(this._currentRangeStart=i,n.push([i,i])),this.pm.data.video_playback_ranges=n}else this._updateLastRangeEnd();this._lastPlayheadTime=i}}},{key:"_endPlaybackRange",value:function(){this._currentRangeStart!==null&&(this._updateLastRangeEnd(),this._currentRangeStart=null,this._lastPlayheadTime=null)}}]),e})(),Db=Mb,Yt=Object.freeze({CELLULAR:"cellular",WIFI:"wifi",WIRED:"wired",OTHER:"other",NO_CONNECTION:"no_connection",UNKNOWN:"unknown"}),xb=function(e){if(!e)return Yt.UNKNOWN;switch(e){case"cellular":case"wimax":return Yt.CELLULAR;case"wifi":return Yt.WIFI;case"ethernet":return Yt.WIRED;case"none":return Yt.NO_CONNECTION;case"bluetooth":case"other":return Yt.OTHER;case"unknown":return Yt.UNKNOWN;default:var t=e;return Yt.OTHER}},Ob=function(e){return typeof e=="object"&&"connection"in e&&typeof e.connection=="object"},pa=_t(qt()),Nb=(function(){"use strict";function e(t){var i=this;ke(this,e),C(this,"pm",void 0),C(this,"lastType",void 0),C(this,"lastLowDataMode",void 0),this.pm=t,this.pm.one("viewinit",function(){var a,r=i.emit.bind(i);r(),pa.default.addEventListener("online",r),pa.default.addEventListener("offline",r),(a=e.connection)===null||a===void 0||a.addEventListener("change",r),i.pm.on("destroy",function(){var n;(n=e.connection)===null||n===void 0||n.removeEventListener("change",r),pa.default.removeEventListener("online",r),pa.default.removeEventListener("offline",r)})})}return ft(e,[{key:"type",get:function(){var t,i;return((t=pa.default.navigator)===null||t===void 0?void 0:t.onLine)===!1?Yt.NO_CONNECTION:!((i=e.connection)===null||i===void 0)&&i.type?xb(e.connection.type):Yt.UNKNOWN}},{key:"lowDataMode",get:function(){var t;return(t=e.connection)===null||t===void 0?void 0:t.saveData}},{key:"emit",value:function(){var t=this.type,i=this.lowDataMode;t===this.lastType&&i===this.lastLowDataMode||(this.lastType=t,this.lastLowDataMode=i,this.pm.emit("networkchange",Jr({viewer_connection_type:t},i!==void 0&&{viewer_connection_low_data_mode:i})))}}],[{key:"connection",get:function(){return Ob(pa.default.navigator)?pa.default.navigator.connection:null}}]),e})(),Pb=Nb,Ub=["viewstart","ended","loadstart","pause","play","playing","ratechange","waiting","adplay","adpause","adended","aderror","adplaying","adrequest","adresponse","adbreakstart","adbreakend","adfirstquartile","admidpoint","adthirdquartile","rebufferstart","rebufferend","seeked","error","hb","requestcompleted","requestfailed","requestcanceled","renditionchange","networkchange","cdnchange","playbackmodechange"],Bb=new Set(["requestcompleted","requestfailed","requestcanceled"]),Hb=(function(e){"use strict";sE(i,e);var t=cE(i);function i(a,r,n){ke(this,i);var s;s=t.call(this),C(F(s),"pageLoadEndTime",void 0),C(F(s),"pageLoadInitTime",void 0),C(F(s),"_destroyed",void 0),C(F(s),"_heartBeatTimeout",void 0),C(F(s),"adTracker",void 0),C(F(s),"dashjs",void 0),C(F(s),"data",void 0),C(F(s),"disablePlayheadRebufferTracking",void 0),C(F(s),"disableRebufferTracking",void 0),C(F(s),"disableAdPlaybackRangeFiltering",void 0),C(F(s),"errorTracker",void 0),C(F(s),"errorTranslator",void 0),C(F(s),"emitTranslator",void 0),C(F(s),"getAdData",void 0),C(F(s),"getPlayheadTime",void 0),C(F(s),"getStateData",void 0),C(F(s),"stateDataTranslator",void 0),C(F(s),"hlsjs",void 0),C(F(s),"id",void 0),C(F(s),"longResumeTracker",void 0),C(F(s),"minimumRebufferDuration",void 0),C(F(s),"mux",void 0),C(F(s),"playbackEventDispatcher",void 0),C(F(s),"playbackHeartbeat",void 0),C(F(s),"playbackHeartbeatTime",void 0),C(F(s),"playheadTime",void 0),C(F(s),"seekingTracker",void 0),C(F(s),"sustainedRebufferThreshold",void 0),C(F(s),"watchTimeTracker",void 0),C(F(s),"currentFragmentPDT",void 0),C(F(s),"currentFragmentStart",void 0),s.pageLoadInitTime=fs.navigationStart(),s.pageLoadEndTime=fs.domContentLoadedEventEnd();var o={debug:!1,minimumRebufferDuration:250,sustainedRebufferThreshold:1e3,playbackHeartbeatTime:25,beaconDomain:"litix.io",sampleRate:1,disableCookies:!1,respectDoNotTrack:!1,disableRebufferTracking:!1,disablePlayheadRebufferTracking:!1,disableAdPlaybackRangeFiltering:!1,errorTranslator:function(m){return m},emitTranslator:function(){for(var m=arguments.length,_=new Array(m),y=0;y<m;y++)_[y]=arguments[y];return _},stateDataTranslator:function(m){return m}};if(s.mux=a,s.id=r,n!=null&&n.beaconDomain&&s.mux.log.warn("The `beaconDomain` setting has been deprecated in favor of `beaconCollectionDomain`. Please change your integration to use `beaconCollectionDomain` instead of `beaconDomain`."),n=Object.assign(o,n),n.data=n.data||{},!1)var l,c;n.data.property_key&&(n.data.env_key=n.data.property_key,delete n.data.property_key),ue.level=n.debug?ha.DEBUG:ha.WARN,s.getPlayheadTime=n.getPlayheadTime,s.getStateData=n.getStateData||function(){return{}},s.getAdData=n.getAdData||function(){},s.minimumRebufferDuration=n.minimumRebufferDuration,s.sustainedRebufferThreshold=n.sustainedRebufferThreshold,s.playbackHeartbeatTime=n.playbackHeartbeatTime,s.disableRebufferTracking=n.disableRebufferTracking,s.disableRebufferTracking&&s.mux.log.warn("Disabling rebuffer tracking. This should only be used in specific circumstances as a last resort when your player is known to unreliably track rebuffering."),s.disablePlayheadRebufferTracking=n.disablePlayheadRebufferTracking,s.disableAdPlaybackRangeFiltering=n.disableAdPlaybackRangeFiltering,s.errorTranslator=n.errorTranslator,s.emitTranslator=n.emitTranslator,s.stateDataTranslator=n.stateDataTranslator,s.playbackEventDispatcher=new Eb(a,n.data.env_key,n),s.data={player_instance_id:jr(),mux_sample_rate:n.sampleRate,beacon_domain:n.beaconCollectionDomain||n.beaconDomain},s.data.view_sequence_number=1,s.data.player_sequence_number=1;var p=function(){typeof this.data.view_start=="undefined"&&(this.data.view_start=this.mux.utils.now(),this.emit("viewstart"),this.emit("renditionchange"))}.bind(F(s));if(s.on("viewinit",function(m,_){this._resetVideoData(),this._resetViewData(),this._resetErrorData(),this._updateStateData(),Object.assign(this.data,_),this._initializeViewData(),this.one("play",p),this.one("adbreakstart",p)}),s.on("videochange",function(m,_){this._resetView(_)}),s.on("programchange",function(m,_){this.data.player_is_paused&&this.mux.log.warn("The `programchange` event is intended to be used when the content changes mid playback without the video source changing, however the video is not currently playing. If the video source is changing please use the videochange event otherwise you will lose startup time information."),this._resetView(Object.assign(_,{view_program_changed:!0})),p(),this.emit("play"),this.emit("playing")}),s.on("fragmentchange",function(m,_){this.currentFragmentPDT=_.currentFragmentPDT,this.currentFragmentStart=_.currentFragmentStart}),s.on("destroy",s.destroy),typeof window!="undefined"&&typeof window.addEventListener=="function"&&typeof window.removeEventListener=="function"){var v=function(){var m=typeof s.data.view_start!="undefined";s.mux.WINDOW_HIDDEN=document.visibilityState==="hidden",m&&s.mux.WINDOW_HIDDEN&&(s.data.player_is_paused||s.emit("hb"))};window.addEventListener("visibilitychange",v,!1);var d=function(m){m.persisted||s.destroy()};window.addEventListener("pagehide",d,!1),s.on("destroy",function(){window.removeEventListener("visibilitychange",v),window.removeEventListener("pagehide",d)})}s.on("playerready",function(m,_){Object.assign(this.data,_)}),Ub.forEach(function(m){s.on(m,function(_,y){m.indexOf("ad")!==0&&this._updateStateData(),Object.assign(this.data,y),this._sanitizeData()}),s.on("after"+m,function(){(m!=="error"||this.errorTracker.viewErrored)&&this.send(m)})}),s.on("viewend",function(m,_){Object.assign(s.data,_)});var u=function(m){var _=this.mux.utils.now();this.data.player_init_time&&(this.data.player_startup_time=_-this.data.player_init_time),this.pageLoadInitTime=this.data.page_load_init_time||this.pageLoadInitTime,this.pageLoadEndTime=this.data.page_load_end_time||this.pageLoadEndTime,!this.mux.PLAYER_TRACKED&&this.pageLoadInitTime&&(this.mux.PLAYER_TRACKED=!0,(this.data.player_init_time||this.pageLoadEndTime)&&(this.data.page_load_time=Math.min(this.data.player_init_time||1/0,this.pageLoadEndTime||1/0)-this.pageLoadInitTime)),this.send("playerready"),delete this.data.player_startup_time,delete this.data.page_load_time};return s.one("playerready",u),s.longResumeTracker=new Ab(F(s)),s.errorTracker=new LE(F(s)),new jE(F(s)),s.seekingTracker=new YE(F(s)),s.playheadTime=new NE(F(s)),s.playbackHeartbeat=new IE(F(s)),new $E(F(s)),s.watchTimeTracker=new ME(F(s)),new xE(F(s)),new Db(F(s)),s.adTracker=new QE(F(s)),new HE(F(s)),new UE(F(s)),new FE(F(s)),new gb(F(s)),new Ib(F(s)),new Cb(F(s)),new Pb(F(s)),n.hlsjs&&s.addHLSJS(n),n.dashjs&&s.addDashJS(n),s.emit("viewinit",n.data),s}return ft(i,[{key:"emit",value:function(a,r){var n,s=Object.assign({viewer_time:this.mux.utils.now()},r),o=[a,s];if(this.emitTranslator)try{o=this.emitTranslator(a,s)}catch(l){this.mux.log.warn("Exception in emit translator callback.",l)}o!=null&&o.length&&(n=_s(Wa(i.prototype),"emit",this)).call.apply(n,[this].concat(Lt(o)))}},{key:"destroy",value:function(){this._destroyed||(this._destroyed=!0,typeof this.data.view_start!="undefined"&&(this.emit("viewend"),this.send("viewend")),this.playbackEventDispatcher.destroy(),this.removeHLSJS(),this.removeDashJS(),window.clearTimeout(this._heartBeatTimeout))}},{key:"send",value:function(a){if(this.data.view_id){var r=Object.assign({},this.data),n=["player_program_time","player_manifest_newest_program_time","player_live_edge_program_time","player_program_time","video_holdback","video_part_holdback","video_target_duration","video_part_target_duration"];if(r.video_source_is_live===void 0&&(r.player_source_duration===1/0||r.video_source_duration===1/0?r.video_source_is_live=!0:(r.player_source_duration>0||r.video_source_duration>0)&&(r.video_source_is_live=!1)),r.video_source_is_live||n.forEach(function(c){r[c]=void 0}),r.video_source_url=r.video_source_url||r.player_source_url,r.video_source_url){var s=fi(Xr(r.video_source_url),2),o=s[0],l=s[1];r.video_source_domain=l,r.video_source_hostname=o}delete r.ad_request_id,r.video_playback_ranges&&(r.video_playback_range=JSON.stringify(r.video_playback_ranges.filter(function(c){return c[0]!==c[1]}).map(function(c){return"".concat(c[0],":").concat(c[1])})),delete r.video_playback_ranges),this.playbackEventDispatcher.send(a,r),this.data.view_sequence_number++,this.data.player_sequence_number++,Bb.has(a)||this._restartHeartBeat(),a==="viewend"&&delete this.data.view_id}}},{key:"_resetView",value:function(a){this.emit("viewend"),this.send("viewend"),this.emit("viewinit",a)}},{key:"_updateStateData",value:function(){var a,r=this.getStateData();if(typeof this.stateDataTranslator=="function")try{r=this.stateDataTranslator(r)}catch(o){this.mux.log.warn("Exception in stateDataTranslator translator callback.",o)}if(!((a=this.data)===null||a===void 0)&&a.video_cdn&&r!=null&&r.video_cdn){var n=r.video_cdn,s=lE(r,["video_cdn"]);r=s}Object.assign(this.data,r),this.playheadTime._updatePlayheadTime(),this._sanitizeData()}},{key:"_sanitizeData",value:function(){var a=this,r=["player_width","player_height","video_source_width","video_source_height","player_playhead_time","video_source_bitrate"];r.forEach(function(s){var o=parseInt(a.data[s],10);a.data[s]=isNaN(o)?void 0:o});var n=["player_source_url","video_source_url"];n.forEach(function(s){if(a.data[s]){var o=a.data[s].toLowerCase();(o.indexOf("data:")===0||o.indexOf("blob:")===0)&&(a.data[s]="MSE style URL")}})}},{key:"_resetVideoData",value:function(){var a=this;Object.keys(this.data).forEach(function(r){r.indexOf("video_")===0&&delete a.data[r]})}},{key:"_resetViewData",value:function(){var a=this;Object.keys(this.data).forEach(function(r){r.indexOf("view_")===0&&delete a.data[r]}),this.data.view_sequence_number=1}},{key:"_resetErrorData",value:function(){delete this.data.player_error_code,delete this.data.player_error_message,delete this.data.player_error_context,delete this.data.player_error_severity,delete this.data.player_error_business_exception}},{key:"_initializeViewData",value:function(){var a=this,r=this.data.view_id=jr(),n=function(){r===a.data.view_id&&Oe(a.data,"player_view_count",1)};this.data.player_is_paused?this.one("play",n):n()}},{key:"_restartHeartBeat",value:function(){var a=this;window.clearTimeout(this._heartBeatTimeout),this._heartBeatTimeout=window.setTimeout(function(){a.data.player_is_paused||a.emit("hb")},1e4)}},{key:"addHLSJS",value:function(a){if(!a.hlsjs){this.mux.log.warn("You must pass a valid hlsjs instance in order to track it.");return}if(this.hlsjs){this.mux.log.warn("An instance of HLS.js is already being monitored for this player.");return}this.hlsjs=a.hlsjs,fE(this.mux,this.id,a.hlsjs,{},a.Hls||window.Hls)}},{key:"removeHLSJS",value:function(){this.hlsjs&&(EE(this.hlsjs),this.hlsjs=void 0)}},{key:"addDashJS",value:function(a){if(!a.dashjs){this.mux.log.warn("You must pass a valid dashjs instance in order to track it.");return}if(this.dashjs){this.mux.log.warn("An instance of Dash.js is already being monitored for this player.");return}this.dashjs=a.dashjs,TE(this.mux,this.id,a.dashjs)}},{key:"removeDashJS",value:function(){this.dashjs&&(AE(this.dashjs),this.dashjs=void 0)}}]),i})(wE),Wb=Hb,tn=_t(Uh());function vd(){return tn.default&&!!(tn.default.fullscreenElement||tn.default.webkitFullscreenElement||tn.default.mozFullScreenElement||tn.default.msFullscreenElement)}var Fb=["loadstart","pause","play","playing","seeking","seeked","timeupdate","ratechange","stalled","waiting","error","ended"],Kb={1:"MEDIA_ERR_ABORTED",2:"MEDIA_ERR_NETWORK",3:"MEDIA_ERR_DECODE",4:"MEDIA_ERR_SRC_NOT_SUPPORTED"};function $b(e,t,i){var a=fi(vs(t),3),r=a[0],n=a[1],s=a[2],o=e.log,l=e.utils.getComputedStyle,c=e.utils.secondsToMs,p={automaticErrorTracking:!0};if(r){if(s!=="video"&&s!=="audio")return o.error("The element of `"+n+"` was not a media element.")}else return o.error("No element was found with the `"+n+"` query selector.");r.mux&&(r.mux.destroy(),delete r.mux,o.warn("Already monitoring this video element, replacing existing event listeners"));var v={getPlayheadTime:function(){return c(r.currentTime)},getStateData:function(){var u,m,_,y=((u=(m=this).getPlayheadTime)===null||u===void 0?void 0:u.call(m))||c(r.currentTime),g=this.hlsjs&&this.hlsjs.url,A=this.dashjs&&typeof this.dashjs.getSource=="function"&&this.dashjs.getSource(),E={player_is_paused:r.paused,player_width:parseInt(l(r,"width")),player_height:parseInt(l(r,"height")),player_autoplay_on:r.autoplay,player_preload_on:r.preload,player_language_code:r.lang,player_is_fullscreen:vd(),video_poster_url:r.poster,video_source_url:g||A||r.currentSrc,video_source_duration:c(r.duration),video_source_height:r.videoHeight,video_source_width:r.videoWidth,view_dropped_frame_count:r==null||(_=r.getVideoPlaybackQuality)===null||_===void 0?void 0:_.call(r).droppedVideoFrames};if(r.getStartDate&&y>0){var T=r.getStartDate();if(T&&typeof T.getTime=="function"&&T.getTime()){var L=T.getTime();if(E.player_program_time=L+y,r.seekable.length>0){var I=L+r.seekable.end(r.seekable.length-1);E.player_live_edge_program_time=I}}}return E}};i=Object.assign(p,i,v),i.data=Object.assign({player_software:"HTML5 Video Element",player_mux_plugin_name:"VideoElementMonitor",player_mux_plugin_version:e.VERSION},i.data),r.mux=r.mux||{},r.mux.deleted=!1,r.mux.emit=function(u,m){e.emit(n,u,m)},r.mux.updateData=function(u){r.mux.emit("hb",u)};var d=function(){o.error("The monitor for this video element has already been destroyed.")};r.mux.destroy=function(){Object.keys(r.mux.listeners).forEach(function(u){r.removeEventListener(u,r.mux.listeners[u],!1)}),delete r.mux.listeners,r.mux.fullscreenChangeListener&&(document.removeEventListener("fullscreenchange",r.mux.fullscreenChangeListener,!1),delete r.mux.fullscreenChangeListener),r.mux.destroy=d,r.mux.swapElement=d,r.mux.emit=d,r.mux.addHLSJS=d,r.mux.addDashJS=d,r.mux.removeHLSJS=d,r.mux.removeDashJS=d,r.mux.updateData=d,r.mux.setEmitTranslator=d,r.mux.setStateDataTranslator=d,r.mux.setGetPlayheadTime=d,r.mux.deleted=!0,e.emit(n,"destroy")},r.mux.swapElement=function(u){var m=fi(vs(u),3),_=m[0],y=m[1],g=m[2];if(_){if(g!=="video"&&g!=="audio")return e.log.error("The element of `"+y+"` was not a media element.")}else return e.log.error("No element was found with the `"+y+"` query selector.");_.muxId=r.muxId,delete r.muxId,_.mux=_.mux||{},_.mux.listeners=Object.assign({},r.mux.listeners),delete r.mux.listeners,Object.keys(_.mux.listeners).forEach(function(A){r.removeEventListener(A,_.mux.listeners[A],!1),_.addEventListener(A,_.mux.listeners[A],!1)}),_.mux.fullscreenChangeListener=r.mux.fullscreenChangeListener,delete r.mux.fullscreenChangeListener,_.mux.swapElement=r.mux.swapElement,_.mux.destroy=r.mux.destroy,delete r.mux,r=_},r.mux.addHLSJS=function(u){e.addHLSJS(n,u)},r.mux.addDashJS=function(u){e.addDashJS(n,u)},r.mux.removeHLSJS=function(){e.removeHLSJS(n)},r.mux.removeDashJS=function(){e.removeDashJS(n)},r.mux.setEmitTranslator=function(u){e.setEmitTranslator(n,u)},r.mux.setStateDataTranslator=function(u){e.setStateDataTranslator(n,u)},r.mux.setGetPlayheadTime=function(u){u||(u=i.getPlayheadTime),e.setGetPlayheadTime(n,u)},e.init(n,i),e.emit(n,"playerready"),r.paused||(e.emit(n,"play"),r.readyState>2&&e.emit(n,"playing")),r.mux.listeners={},Fb.forEach(function(u){u==="error"&&!i.automaticErrorTracking||(r.mux.listeners[u]=function(){var m={};if(u==="error"){if(!r.error||r.error.code===1)return;m.player_error_code=r.error.code,m.player_error_message=Kb[r.error.code]||r.error.message}e.emit(n,u,m)},r.addEventListener(u,r.mux.listeners[u],!1))}),r.mux.listeners.enterpictureinpicture=function(){e.emit(n,"playbackmodechange",{player_playback_mode:"pip",player_playback_mode_data:"{}"})},r.mux.listeners.leavepictureinpicture=function(){var u=vd()?"fullscreen":"standard";e.emit(n,"playbackmodechange",{player_playback_mode:u,player_playback_mode_data:"{}"})},r.addEventListener("enterpictureinpicture",r.mux.listeners.enterpictureinpicture,!1),r.addEventListener("leavepictureinpicture",r.mux.listeners.leavepictureinpicture,!1),r.mux.fullscreenChangeListener=function(){var u=vd(),m=document.fullscreenElement;if(u&&(m===r||m!=null&&m.contains(r)))e.emit(n,"playbackmodechange",{player_playback_mode:"fullscreen",player_playback_mode_data:"{}"});else if(!u){var _=document.pictureInPictureElement===r,y=_?"pip":"standard";e.emit(n,"playbackmodechange",{player_playback_mode:y,player_playback_mode_data:"{}"})}},document.addEventListener("fullscreenchange",r.mux.fullscreenChangeListener,!1)}function Vb(e,t,i,a){var r=a;if(e&&typeof e[t]=="function")try{r=e[t].apply(e,i)}catch(n){ue.info("safeCall error",n)}return r}var an=_t(qt()),Fa;an.default&&an.default.WeakMap&&(Fa=new WeakMap);function qb(e,t){if(!e||!t||!an.default||typeof an.default.getComputedStyle!="function")return"";var i;return Fa&&Fa.has(e)&&(i=Fa.get(e)),i||(i=an.default.getComputedStyle(e,null),Fa&&Fa.set(e,i)),i.getPropertyValue(t)}function Yb(e){return Math.floor(e*1e3)}var va={TARGET_DURATION:"#EXT-X-TARGETDURATION",PART_INF:"#EXT-X-PART-INF",SERVER_CONTROL:"#EXT-X-SERVER-CONTROL",INF:"#EXTINF",PROGRAM_DATE_TIME:"#EXT-X-PROGRAM-DATE-TIME",VERSION:"#EXT-X-VERSION",SESSION_DATA:"#EXT-X-SESSION-DATA"},gs=function(e){return this.buffer="",this.manifest={segments:[],serverControl:{},sessionData:{}},this.currentUri={},this.process(e),this.manifest};gs.prototype.process=function(e){var t;for(this.buffer+=e,t=this.buffer.indexOf(`
`);t>-1;t=this.buffer.indexOf(`
`))this.processLine(this.buffer.substring(0,t)),this.buffer=this.buffer.substring(t+1)},gs.prototype.processLine=function(e){var t=e.indexOf(":"),i=Zb(e,t),a=i[0],r=i.length===2?fd(i[1]):void 0;if(a[0]!=="#")this.currentUri.uri=a,this.manifest.segments.push(this.currentUri),this.manifest.targetDuration&&!("duration"in this.currentUri)&&(this.currentUri.duration=this.manifest.targetDuration),this.currentUri={};else switch(a){case va.TARGET_DURATION:{if(!isFinite(r)||r<0)return;this.manifest.targetDuration=r,this.setHoldBack();break}case va.PART_INF:{_d(this.manifest,i),this.manifest.partInf.partTarget&&(this.manifest.partTargetDuration=this.manifest.partInf.partTarget),this.setHoldBack();break}case va.SERVER_CONTROL:{_d(this.manifest,i),this.setHoldBack();break}case va.INF:{r===0?this.currentUri.duration=.01:r>0&&(this.currentUri.duration=r);break}case va.PROGRAM_DATE_TIME:{var n=r,s=new Date(n);this.manifest.dateTimeString||(this.manifest.dateTimeString=n,this.manifest.dateTimeObject=s),this.currentUri.dateTimeString=n,this.currentUri.dateTimeObject=s;break}case va.VERSION:{_d(this.manifest,i);break}case va.SESSION_DATA:{var o=jb(i[1]),l=$h(o);Object.assign(this.manifest.sessionData,l)}}},gs.prototype.setHoldBack=function(){var e=this.manifest,t=e.serverControl,i=e.targetDuration,a=e.partTargetDuration;if(t){var r="holdBack",n="partHoldBack",s=i&&i*3,o=a&&a*2;i&&!t.hasOwnProperty(r)&&(t[r]=s),s&&t[r]<s&&(t[r]=s),a&&!t.hasOwnProperty(n)&&(t[n]=a*3),a&&t[n]<o&&(t[n]=o)}};var _d=function(e,t){var i=im(t[0].replace("#EXT-X-","")),a;Qb(t[1])?(a={},a=Object.assign(zb(t[1]),a)):a=fd(t[1]),e[i]=a},im=function(e){return e.toLowerCase().replace(/-(\w)/g,function(t){return t[1].toUpperCase()})},fd=function(e){if(e.toLowerCase()==="yes"||e.toLowerCase()==="no")return e.toLowerCase()==="yes";var t=e.indexOf(":")!==-1?e:parseFloat(e);return isNaN(t)?e:t},Gb=function(e){var t={},i=e.split("=");if(i.length>1){var a=im(i[0]);t[a]=fd(i[1])}return t},zb=function(e){for(var t=e.split(","),i={},a=0;t.length>a;a++){var r=t[a],n=Gb(r);i=Object.assign(n,i)}return i},Qb=function(e){return e.indexOf("=")>-1},Zb=function(e,t){return t===-1?[e]:[e.substring(0,t),e.substring(t+1)]},jb=function(e){var t={};if(e){var i=e.search(","),a=e.slice(0,i),r=e.slice(i+1),n=[a,r];return n.forEach(function(s,o){for(var l=s.replace(/['"]+/g,"").split("="),c=0;c<l.length;c++)l[c]==="DATA-ID"&&(t["DATA-ID"]=l[1-c]),l[c]==="VALUE"&&(t.VALUE=l[1-c])}),{data:t}}},Xb=gs,Jb={safeCall:Vb,safeIncrement:Oe,getComputedStyle:qb,secondsToMs:Yb,assign:Object.assign,headersStringToObject:cd,cdnHeadersToRequestId:Es,extractHostnameAndDomain:Xr,extractHostname:Ct,manifestParser:Xb,generateShortID:Wh,generateUUID:jr,now:He.now,findMediaElement:vs},eg=Jb,tg={PLAYER_READY:"playerready",VIEW_INIT:"viewinit",VIDEO_CHANGE:"videochange",PLAY:"play",PAUSE:"pause",PLAYING:"playing",TIME_UPDATE:"timeupdate",SEEKING:"seeking",SEEKED:"seeked",REBUFFER_START:"rebufferstart",REBUFFER_END:"rebufferend",ERROR:"error",ENDED:"ended",RENDITION_CHANGE:"renditionchange",ORIENTATION_CHANGE:"orientationchange",PLAYBACK_MODE_CHANGE:"playbackmodechange",NETWORK_CHANGE:"networkchange",AD_REQUEST:"adrequest",AD_RESPONSE:"adresponse",AD_BREAK_START:"adbreakstart",AD_PLAY:"adplay",AD_PLAYING:"adplaying",AD_PAUSE:"adpause",AD_FIRST_QUARTILE:"adfirstquartile",AD_MID_POINT:"admidpoint",AD_THIRD_QUARTILE:"adthirdquartile",AD_ENDED:"adended",AD_BREAK_END:"adbreakend",AD_ERROR:"aderror",REQUEST_COMPLETED:"requestcompleted",REQUEST_FAILED:"requestfailed",REQUEST_CANCELLED:"requestcanceled",HEARTBEAT:"hb",DESTROY:"destroy"},ig=tg,ag="mux-embed",rg="5.18.1",ng="2.1",Ie={},Ui=function(e){var t=arguments;typeof e=="string"?Ui.hasOwnProperty(e)?Zr.default.setTimeout(function(){t=Array.prototype.splice.call(t,1),Ui[e].apply(null,t)},0):ue.warn("`"+e+"` is an unknown task"):typeof e=="function"?Zr.default.setTimeout(function(){e(Ui)},0):ue.warn("`"+e+"` is invalid.")},sg={loaded:He.now(),NAME:ag,VERSION:rg,API_VERSION:ng,PLAYER_TRACKED:!1,monitor:function(e,t){return $b(Ui,e,t)},destroyMonitor:function(e){var t=fi(vs(e),1),i=t[0];i&&i.mux&&typeof i.mux.destroy=="function"?i.mux.destroy():ue.error("A video element monitor for `"+e+"` has not been initialized via `mux.monitor`.")},addHLSJS:function(e,t){var i=Rt(e);Ie[i]?Ie[i].addHLSJS(t):ue.error("A monitor for `"+i+"` has not been initialized.")},addDashJS:function(e,t){var i=Rt(e);Ie[i]?Ie[i].addDashJS(t):ue.error("A monitor for `"+i+"` has not been initialized.")},removeHLSJS:function(e){var t=Rt(e);Ie[t]?Ie[t].removeHLSJS():ue.error("A monitor for `"+t+"` has not been initialized.")},removeDashJS:function(e){var t=Rt(e);Ie[t]?Ie[t].removeDashJS():ue.error("A monitor for `"+t+"` has not been initialized.")},init:function(e,t){od()&&t&&t.respectDoNotTrack&&ue.info("The browser's Do Not Track flag is enabled - Mux beaconing is disabled.");var i=Rt(e);Ie[i]=new Wb(Ui,i,t)},emit:function(e,t,i){var a=Rt(e);Ie[a]?(Ie[a].emit(t,i),t==="destroy"&&delete Ie[a]):ue.error("A monitor for `"+a+"` has not been initialized.")},updateData:function(e,t){var i=Rt(e);Ie[i]?Ie[i].emit("hb",t):ue.error("A monitor for `"+i+"` has not been initialized.")},setEmitTranslator:function(e,t){var i=Rt(e);Ie[i]?Ie[i].emitTranslator=t:ue.error("A monitor for `"+i+"` has not been initialized.")},setStateDataTranslator:function(e,t){var i=Rt(e);Ie[i]?Ie[i].stateDataTranslator=t:ue.error("A monitor for `"+i+"` has not been initialized.")},setGetPlayheadTime:function(e,t){var i=Rt(e);Ie[i]?Ie[i].getPlayheadTime=t:ue.error("A monitor for `"+i+"` has not been initialized.")},checkDoNotTrack:od,log:ue,utils:eg,events:ig,WINDOW_HIDDEN:!1,WINDOW_UNLOADING:!1};Object.assign(Ui,sg),typeof Zr.default!="undefined"&&typeof Zr.default.addEventListener=="function"&&Zr.default.addEventListener("pagehide",function(e){e.persisted||(Ui.WINDOW_UNLOADING=!0)},!1);var Ed=Ui;var am=$(64945),Q=am.Ay,re={VIDEO:"video",THUMBNAIL:"thumbnail",STORYBOARD:"storyboard",DRM:"drm"},N={NOT_AN_ERROR:0,NETWORK_OFFLINE:2000002,NETWORK_RECONNECTING:2000003,NETWORK_UNKNOWN_ERROR:2e6,NETWORK_NO_STATUS:2000001,NETWORK_INVALID_URL:24e5,NETWORK_NOT_FOUND:2404e3,NETWORK_NOT_READY:2412e3,NETWORK_GENERIC_SERVER_FAIL:25e5,NETWORK_TOKEN_MISSING:2403201,NETWORK_TOKEN_MALFORMED:2412202,NETWORK_TOKEN_EXPIRED:2403210,NETWORK_TOKEN_AUD_MISSING:2403221,NETWORK_TOKEN_AUD_MISMATCH:2403222,NETWORK_TOKEN_SUB_MISMATCH:2403232,ENCRYPTED_ERROR:5e6,ENCRYPTED_UNSUPPORTED_KEY_SYSTEM:5000001,ENCRYPTED_GENERATE_REQUEST_FAILED:5000002,ENCRYPTED_UPDATE_LICENSE_FAILED:5000003,ENCRYPTED_UPDATE_SERVER_CERT_FAILED:5000004,ENCRYPTED_CDM_ERROR:5000005,ENCRYPTED_OUTPUT_RESTRICTED:5000006,ENCRYPTED_MISSING_TOKEN:5000002},ys=e=>e===re.VIDEO?"playback":e,Bi=class cs extends Error{constructor(t,i=cs.MEDIA_ERR_CUSTOM,a,r){var n;super(t),this.name="MediaError",this.code=i,this.context=r,this.fatal=a!=null?a:i>=cs.MEDIA_ERR_NETWORK&&i<=cs.MEDIA_ERR_ENCRYPTED,this.message||(this.message=(n=cs.defaultMessages[this.code])!=null?n:"")}};Bi.MEDIA_ERR_ABORTED=1,Bi.MEDIA_ERR_NETWORK=2,Bi.MEDIA_ERR_DECODE=3,Bi.MEDIA_ERR_SRC_NOT_SUPPORTED=4,Bi.MEDIA_ERR_ENCRYPTED=5,Bi.MEDIA_ERR_CUSTOM=100,Bi.defaultMessages={1:"You aborted the media playback",2:"A network error caused the media download to fail.",3:"A media error caused playback to be aborted. The media could be corrupt or your browser does not support this format.",4:"An unsupported error occurred. The server or network failed, or your browser does not support this format.",5:"The media is encrypted and there are no keys to decrypt it."};var M=Bi,og=e=>e==null,bd=(e,t)=>og(t)?!1:e in t,gd={ANY:"any",MUTED:"muted"},se={ON_DEMAND:"on-demand",LIVE:"live",UNKNOWN:"unknown"},Gt={MSE:"mse",NATIVE:"native"},rn={HEADER:"header",QUERY:"query",NONE:"none"},Ts=Object.values(rn),bi={M3U8:"application/vnd.apple.mpegurl",MP4:"video/mp4"},yd={HLS:bi.M3U8},Rw=Object.keys(yd),Lw=[...Object.values(bi),"hls","HLS"],lg={upTo720p:"720p",upTo1080p:"1080p",upTo1440p:"1440p",upTo2160p:"2160p"},dg={noLessThan480p:"480p",noLessThan540p:"540p",noLessThan720p:"720p",noLessThan1080p:"1080p",noLessThan1440p:"1440p",noLessThan2160p:"2160p"},ug={DESCENDING:"desc"},Cw=null,cg="en",Td={code:cg},Ae=(e,t,i,a,r=e)=>{r.addEventListener(t,i,a),e.addEventListener("teardown",()=>{r.removeEventListener(t,i)},{once:!0})};function hg(e,t,i){t&&i>t&&(i=t);for(let a=0;a<e.length;a++)if(e.start(a)<=i&&e.end(a)>=i)return!0;return!1}var Ad=e=>{let t=e.indexOf("?");if(t<0)return[e];let i=e.slice(0,t),a=e.slice(t);return[i,a]},As=e=>{let{type:t}=e;if(t){let i=t.toUpperCase();return bd(i,yd)?yd[i]:t}return mg(e)},rm=e=>e==="VOD"?se.ON_DEMAND:se.LIVE,nm=e=>e==="EVENT"?Number.POSITIVE_INFINITY:e==="VOD"?Number.NaN:0,mg=e=>{let{src:t}=e;if(!t)return"";let i="";try{i=wd(t).pathname}catch(n){console.error("Invalid url when trying to infer mime type",t)}let a=i.lastIndexOf(".");if(a<0)return _g(e)?bi.M3U8:"";let r=i.slice(a+1).toUpperCase();return bd(r,bi)?bi[r]:""},kd=e=>{try{return new URL(e),!1}catch(t){return!0}},pg=e=>e.split(`
`).find((t,i,a)=>i>0&&a[i-1].startsWith("#EXT-X-STREAM-INF")),wd=(e,t)=>{var i;if(!kd(e))return new URL(e);let a=(i=window==null?void 0:window.location)==null?void 0:i.href,r=t!=null?t:a;return t&&kd(t.toString())&&(r=new URL(t,a)),new URL(e,r)},vg="mux.com",_g=({src:e,customDomain:t=vg})=>{let i;try{i=new URL(`${e}`)}catch(l){return!1}let a=i.protocol==="https:",r=i.hostname===`stream.${t}`.toLowerCase(),n=i.pathname.split("/"),s=n.length===2,o=!(n!=null&&n[1].includes("."));return a&&r&&s&&o},Ka=e=>{let t=(e!=null?e:"").split(".")[1];if(t)try{let i=t.replace(/-/g,"+").replace(/_/g,"/"),a=decodeURIComponent(atob(i).split("").map(function(r){return"%"+("00"+r.charCodeAt(0).toString(16)).slice(-2)}).join(""));return JSON.parse(a)}catch(i){return}},fg=({exp:e},t=Date.now())=>!e||e*1e3<t,Eg=({sub:e},t)=>e!==t,bg=({aud:e},t)=>!e,gg=({aud:e},t)=>e!==t,sm="en";function O(e,t=!0){var i,a;let r=t&&(a=(i=Td)==null?void 0:i[e])!=null?a:e,n=t?Td.code:sm;return new yg(r,n)}var yg=class{constructor(e,t=(i=>(i=Td)!=null?i:sm)()){this.message=e,this.locale=t}format(e){return this.message.replace(/\{(\w+)\}/g,(t,i)=>{var a;return(a=e[i])!=null?a:""})}toString(){return this.message}},Tg=Object.values(gd),om=e=>typeof e=="boolean"||typeof e=="string"&&Tg.includes(e),Ag=(e,t,i)=>{let{autoplay:a}=e,r=!1,n=!1,s=om(a)?a:!!a,o=()=>{r||Ae(t,"playing",()=>{r=!0},{once:!0})};if(o(),Ae(t,"loadstart",()=>{r=!1,o(),Sd(t,s)},{once:!0}),Ae(t,"loadstart",()=>{i||(e.streamType&&e.streamType!==se.UNKNOWN?n=e.streamType===se.LIVE:n=!Number.isFinite(t.duration)),Sd(t,s)},{once:!0}),i&&i.once(Q.Events.LEVEL_LOADED,(l,c)=>{var p;e.streamType&&e.streamType!==se.UNKNOWN?n=e.streamType===se.LIVE:n=(p=c.details.live)!=null?p:!1}),!s){let l=()=>{!n||Number.isFinite(e.startTime)||(i!=null&&i.liveSyncPosition?t.currentTime=i.liveSyncPosition:Number.isFinite(t.seekable.end(0))&&(t.currentTime=t.seekable.end(0)))};i&&Ae(t,"play",()=>{t.preload==="metadata"?i.once(Q.Events.LEVEL_UPDATED,l):l()},{once:!0})}return l=>{r||(s=om(l)?l:!!l,Sd(t,s))}},Sd=(e,t)=>{if(!t)return;let i=e.muted,a=()=>e.muted=i;switch(t){case gd.ANY:e.play().catch(()=>{e.muted=!0,e.play().catch(a)});break;case gd.MUTED:e.muted=!0,e.play().catch(a);break;default:e.play().catch(()=>{});break}},kg=({preload:e,src:t},i,a)=>{let r=v=>{v!=null&&["","none","metadata","auto"].includes(v)?i.setAttribute("preload",v):i.removeAttribute("preload")};if(!a)return r(e),r;let n=!1,s=!1,o=a.config.maxBufferLength,l=a.config.maxBufferSize,c=v=>{r(v);let d=v!=null?v:i.preload;s||d==="none"||(d==="metadata"?(a.config.maxBufferLength=1,a.config.maxBufferSize=1):(a.config.maxBufferLength=o,a.config.maxBufferSize=l),p())},p=()=>{!n&&t&&(n=!0,a.loadSource(t))};return Ae(i,"play",()=>{s=!0,a.config.maxBufferLength=o,a.config.maxBufferSize=l,p()},{once:!0}),c(e),c},wg=(e,t,i)=>{let{minPreloadSegments:a}=e;if(a==null||a<=0||!i)return;let r=0,n=!1,s=t.playbackRate||1,o=()=>{t.playbackRate!==0&&(s=t.playbackRate,t.playbackRate=0)};t.playbackRate=0,Ae(t,"ratechange",o);let l=(c,{frag:p})=>{n||p.type!=="main"||(r++,r>=a&&(n=!0,t.removeEventListener("ratechange",o),t.playbackRate=s))};i.on(Q.Events.FRAG_BUFFERED,l),t.addEventListener("teardown",()=>{n||(n=!0,i.off(Q.Events.FRAG_BUFFERED,l),t.playbackRate=s)},{once:!0})},Sg=(e,t,i)=>{let{initialEstimateSegments:a}=e;if(a==null||a<=0||!i)return;let r=0;i.on(Q.Events.FRAG_BUFFERED,(n,{frag:s})=>{s.type==="main"&&(r++,r<a&&i.abrController.resetEstimator(i.config.abrEwmaDefaultEstimate))})};function Ig(e,t){var i;if(!("videoTracks"in e))return;let a=new WeakMap;t.on(Q.Events.MANIFEST_PARSED,function(c,p){l();let v=e.addVideoTrack("main");v.selected=!0;for(let[d,u]of p.levels.entries()){let m=v.addRendition(u.url[0],u.width,u.height,u.videoCodec,u.bitrate);a.set(u,`${d}`),m.id=`${d}`}}),t.on(Q.Events.AUDIO_TRACKS_UPDATED,function(c,p){o();for(let v of p.audioTracks){let d=v.default?"main":"alternative",u=e.addAudioTrack(d,v.name,v.lang);u.id=`${v.id}`,v.default&&(u.enabled=!0)}});let r=()=>{var c;let p=+((c=[...e.audioTracks].find(d=>d.enabled))==null?void 0:c.id),v=t.audioTracks.map(d=>d.id);p!=t.audioTrack&&v.includes(p)&&(t.audioTrack=p)};e.audioTracks.addEventListener("change",r),t.on(Q.Events.LEVELS_UPDATED,function(c,p){var v;let d=e.videoTracks[(v=e.videoTracks.selectedIndex)!=null?v:0];if(!d)return;let u=p.levels.map(m=>a.get(m));for(let m of e.videoRenditions)m.id&&!u.includes(m.id)&&d.removeRendition(m)});let n=c=>{let p=c.target.selectedIndex;p!=t.nextLevel&&(t.nextLevel=p)};(i=e.videoRenditions)==null||i.addEventListener("change",n);let s=()=>{for(let c of e.videoTracks)e.removeVideoTrack(c)},o=()=>{for(let c of e.audioTracks)e.removeAudioTrack(c)},l=()=>{s(),o()};t.once(Q.Events.DESTROYING,()=>{var c,p;l(),(c=e.audioTracks)==null||c.removeEventListener("change",r),(p=e.videoRenditions)==null||p.removeEventListener("change",n)})}var Id=e=>"time"in e?e.time:e.startTime;function Rg(e,t){t.on(Q.Events.NON_NATIVE_TEXT_TRACKS_FOUND,(r,{tracks:n})=>{n.forEach(s=>{var o,l;let c=(o=s.subtitleTrack)!=null?o:s.closedCaptions,p=t.subtitleTracks.findIndex(({lang:d,name:u,type:m})=>d==(c==null?void 0:c.lang)&&u===s.label&&m.toLowerCase()===s.kind),v=((l=s._id)!=null?l:s.default)?"default":`${s.kind}${p}`;Rd(e,s.kind,s.label,c==null?void 0:c.lang,v,s.default)})});let i=()=>{if(!t.subtitleTracks.length)return;let r=Array.from(e.textTracks).find(o=>o.id&&o.mode==="showing"&&["subtitles","captions"].includes(o.kind));if(!r)return;let n=t.subtitleTracks[t.subtitleTrack],s=n?n.default?"default":`${t.subtitleTracks[t.subtitleTrack].type.toLowerCase()}${t.subtitleTrack}`:void 0;if(t.subtitleTrack<0||(r==null?void 0:r.id)!==s){let o=t.subtitleTracks.findIndex(({lang:l,name:c,type:p,default:v})=>r.id==="default"&&v||l==r.language&&c===r.label&&p.toLowerCase()===r.kind);t.subtitleTrack=o}(r==null?void 0:r.id)===s&&r.cues&&Array.from(r.cues).forEach(o=>{r.addCue(o)})};e.textTracks.addEventListener("change",i),t.on(Q.Events.CUES_PARSED,(r,{track:n,cues:s})=>{let o=e.textTracks.getTrackById(n);if(!o)return;let l=o.mode==="disabled";l&&(o.mode="hidden"),s.forEach(c=>{var p;(p=o.cues)!=null&&p.getCueById(c.id)||o.addCue(c)}),l&&(o.mode="disabled")}),t.once(Q.Events.DESTROYING,()=>{e.textTracks.removeEventListener("change",i),e.querySelectorAll("track[data-removeondestroy]").forEach(r=>{r.remove()})});let a=()=>{Array.from(e.textTracks).forEach(r=>{var n,s;if(!["subtitles","caption"].includes(r.kind)&&(r.label==="thumbnails"||r.kind==="chapters")){if(!((n=r.cues)!=null&&n.length)){let o="track";r.kind&&(o+=`[kind="${r.kind}"]`),r.label&&(o+=`[label="${r.label}"]`);let l=e.querySelector(o),c=(s=l==null?void 0:l.getAttribute("src"))!=null?s:"";l==null||l.removeAttribute("src"),setTimeout(()=>{l==null||l.setAttribute("src",c)},0)}r.mode!=="hidden"&&(r.mode="hidden")}})};t.once(Q.Events.MANIFEST_LOADED,a),t.once(Q.Events.MEDIA_ATTACHED,a)}function Rd(e,t,i,a,r,n){let s=document.createElement("track");return s.kind=t,s.label=i,a&&(s.srclang=a),r&&(s.id=r),n&&(s.default=!0),s.track.mode=["subtitles","captions"].includes(t)?"disabled":"hidden",s.setAttribute("data-removeondestroy",""),e.append(s),s.track}function Lg(e,t){let i=Array.prototype.find.call(e.querySelectorAll("track"),a=>a.track===t);i==null||i.remove()}function nn(e,t,i){var a;return(a=Array.from(e.querySelectorAll("track")).find(r=>r.track.label===t&&r.track.kind===i))==null?void 0:a.track}function lm(e,t,i,a){return W(this,null,function*(){let r=nn(e,i,a);return r||(r=Rd(e,a,i),r.mode="hidden",yield new Promise(n=>setTimeout(()=>n(void 0),0))),r.mode!=="hidden"&&(r.mode="hidden"),[...t].sort((n,s)=>Id(s)-Id(n)).forEach(n=>{var s,o;let l=n.value,c=Id(n);if("endTime"in n&&n.endTime!=null)r==null||r.addCue(new VTTCue(c,n.endTime,a==="chapters"?l:JSON.stringify(l!=null?l:null)));else{let p=Array.prototype.findIndex.call(r==null?void 0:r.cues,m=>m.startTime>=c),v=(s=r==null?void 0:r.cues)==null?void 0:s[p],d=v?v.startTime:Number.isFinite(e.duration)?e.duration:Number.MAX_SAFE_INTEGER,u=(o=r==null?void 0:r.cues)==null?void 0:o[p-1];u&&(u.endTime=c),r==null||r.addCue(new VTTCue(c,d,a==="chapters"?l:JSON.stringify(l!=null?l:null)))}}),e.textTracks.dispatchEvent(new Event("change",{bubbles:!0,composed:!0})),r})}var Ld="cuepoints",dm=Object.freeze({label:Ld});function um(a,r){return W(this,arguments,function*(e,t,i=dm){return lm(e,t,i.label,"metadata")})}var Cd=e=>({time:e.startTime,value:JSON.parse(e.text)});function Cg(e,t={label:Ld}){let i=nn(e,t.label,"metadata");return i!=null&&i.cues?Array.from(i.cues,a=>Cd(a)):[]}function cm(e,t={label:Ld}){var i,a;let r=nn(e,t.label,"metadata");if(!((i=r==null?void 0:r.activeCues)!=null&&i.length))return;if(r.activeCues.length===1)return Cd(r.activeCues[0]);let{currentTime:n}=e,s=Array.prototype.find.call((a=r.activeCues)!=null?a:[],({startTime:o,endTime:l})=>o<=n&&l>n);return Cd(s||r.activeCues[0])}function Mg(i){return W(this,arguments,function*(e,t=dm){return new Promise(a=>{Ae(e,"loadstart",()=>W(null,null,function*(){let r=yield um(e,[],t);Ae(e,"cuechange",()=>{let n=cm(e);if(n){let s=new CustomEvent("cuepointchange",{composed:!0,bubbles:!0,detail:n});e.dispatchEvent(s)}},{},r),a(r)}))})})}var Md="chapters",hm=Object.freeze({label:Md}),Dd=e=>({startTime:e.startTime,endTime:e.endTime,value:e.text});function mm(a,r){return W(this,arguments,function*(e,t,i=hm){return lm(e,t,i.label,"chapters")})}function Dg(e,t={label:Md}){var i;let a=nn(e,t.label,"chapters");return(i=a==null?void 0:a.cues)!=null&&i.length?Array.from(a.cues,r=>Dd(r)):[]}function pm(e,t={label:Md}){var i,a;let r=nn(e,t.label,"chapters");if(!((i=r==null?void 0:r.activeCues)!=null&&i.length))return;if(r.activeCues.length===1)return Dd(r.activeCues[0]);let{currentTime:n}=e,s=Array.prototype.find.call((a=r.activeCues)!=null?a:[],({startTime:o,endTime:l})=>o<=n&&l>n);return Dd(s||r.activeCues[0])}function xg(i){return W(this,arguments,function*(e,t=hm){return new Promise(a=>{Ae(e,"loadstart",()=>W(null,null,function*(){let r=yield mm(e,[],t);Ae(e,"cuechange",()=>{let n=pm(e);if(n){let s=new CustomEvent("chapterchange",{composed:!0,bubbles:!0,detail:n});e.dispatchEvent(s)}},{},r),a(r)}))})})}function Og(e,t){if(t){let i=t.playingDate;if(i!=null)return new Date(i.getTime()-e.currentTime*1e3)}return typeof e.getStartDate=="function"?e.getStartDate():new Date(NaN)}function Ng(e,t){if(t&&t.playingDate)return t.playingDate;if(typeof e.getStartDate=="function"){let i=e.getStartDate();return new Date(i.getTime()+e.currentTime*1e3)}return new Date(NaN)}var sn={VIDEO:"v",THUMBNAIL:"t",STORYBOARD:"s",DRM:"d"},Pg=e=>{if(e===re.VIDEO)return sn.VIDEO;if(e===re.DRM)return sn.DRM},Ug=(e,t)=>{var i,a;let r=ys(e),n=`${r}Token`;return(i=t.tokens)!=null&&i[r]?(a=t.tokens)==null?void 0:a[r]:bd(n,t)?t[n]:void 0},ks=(e,t,i,a,r=!1,n=!(s=>(s=globalThis.navigator)==null?void 0:s.onLine)())=>{var s,o;if(n){let g=O("Your device appears to be offline",r),A,E=M.MEDIA_ERR_NETWORK,T=new M(g,E,!1,A);return T.errorCategory=t,T.muxCode=N.NETWORK_OFFLINE,T.data=e,T}let l="status"in e?e.status:e.code,c=Date.now(),p=M.MEDIA_ERR_NETWORK;if(l===200)return;let v=ys(t),d=Ug(t,i),u=Pg(t),[m]=Ad((s=i.playbackId)!=null?s:"");if(!l||!m)return;let _=Ka(d);if(d&&!_){let g=O("The {tokenNamePrefix}-token provided is invalid or malformed.",r).format({tokenNamePrefix:v}),A=O("Compact JWT string: {token}",r).format({token:d}),E=new M(g,p,!0,A);return E.errorCategory=t,E.muxCode=N.NETWORK_TOKEN_MALFORMED,E.data=e,E}if(l>=500){let g=new M("",p,a!=null?a:!0);return g.errorCategory=t,g.muxCode=N.NETWORK_UNKNOWN_ERROR,g}if(l===403)if(_){if(fg(_,c)){let g={timeStyle:"medium",dateStyle:"medium"},A=O("The video\u2019s secured {tokenNamePrefix}-token has expired.",r).format({tokenNamePrefix:v}),E=O("Expired at: {expiredDate}. Current time: {currentDate}.",r).format({expiredDate:new Intl.DateTimeFormat("en",g).format((o=_.exp)!=null?o:0*1e3),currentDate:new Intl.DateTimeFormat("en",g).format(c)}),T=new M(A,p,!0,E);return T.errorCategory=t,T.muxCode=N.NETWORK_TOKEN_EXPIRED,T.data=e,T}if(Eg(_,m)){let g=O("The video\u2019s playback ID does not match the one encoded in the {tokenNamePrefix}-token.",r).format({tokenNamePrefix:v}),A=O("Specified playback ID: {playbackId} and the playback ID encoded in the {tokenNamePrefix}-token: {tokenPlaybackId}",r).format({tokenNamePrefix:v,playbackId:m,tokenPlaybackId:_.sub}),E=new M(g,p,!0,A);return E.errorCategory=t,E.muxCode=N.NETWORK_TOKEN_SUB_MISMATCH,E.data=e,E}if(bg(_,u)){let g=O("The {tokenNamePrefix}-token is formatted with incorrect information.",r).format({tokenNamePrefix:v}),A=O("The {tokenNamePrefix}-token has no aud value. aud value should be {expectedAud}.",r).format({tokenNamePrefix:v,expectedAud:u}),E=new M(g,p,!0,A);return E.errorCategory=t,E.muxCode=N.NETWORK_TOKEN_AUD_MISSING,E.data=e,E}if(gg(_,u)){let g=O("The {tokenNamePrefix}-token is formatted with incorrect information.",r).format({tokenNamePrefix:v}),A=O("The {tokenNamePrefix}-token has an incorrect aud value: {aud}. aud value should be {expectedAud}.",r).format({tokenNamePrefix:v,expectedAud:u,aud:_.aud}),E=new M(g,p,!0,A);return E.errorCategory=t,E.muxCode=N.NETWORK_TOKEN_AUD_MISMATCH,E.data=e,E}}else{let g=O("Authorization error trying to access this {category} URL. If this is a signed URL, you might need to provide a {tokenNamePrefix}-token.",r).format({tokenNamePrefix:v,category:t}),A=O("Specified playback ID: {playbackId}",r).format({playbackId:m}),E=new M(g,p,a!=null?a:!0,A);return E.errorCategory=t,E.muxCode=N.NETWORK_TOKEN_MISSING,E.data=e,E}if(l===412){let g=O("This playback-id may belong to a live stream that is not currently active or an asset that is not ready.",r),A=O("Specified playback ID: {playbackId}",r).format({playbackId:m}),E=new M(g,p,a!=null?a:!0,A);return E.errorCategory=t,E.muxCode=N.NETWORK_NOT_READY,E.streamType=i.streamType===se.LIVE?"live":i.streamType===se.ON_DEMAND?"on-demand":"unknown",E.data=e,E}if(l===404){let g=O("This URL or playback-id does not exist. You may have used an Asset ID or an ID from a different resource.",r),A=O("Specified playback ID: {playbackId}",r).format({playbackId:m}),E=new M(g,p,a!=null?a:!0,A);return E.errorCategory=t,E.muxCode=N.NETWORK_NOT_FOUND,E.data=e,E}if(l===400){let g=O("The URL or playback-id was invalid. You may have used an invalid value as a playback-id."),A=O("Specified playback ID: {playbackId}",r).format({playbackId:m}),E=new M(g,p,a!=null?a:!0,A);return E.errorCategory=t,E.muxCode=N.NETWORK_INVALID_URL,E.data=e,E}let y=new M("",p,a!=null?a:!0);return y.errorCategory=t,y.muxCode=N.NETWORK_UNKNOWN_ERROR,y.data=e,y},vm=Q.DefaultConfig.capLevelController,Bg={"720p":921600,"1080p":2073600,"1440p":4194304,"2160p":8294400};function Hg(e){let t=e.toLowerCase().trim();return Bg[t]}var xd=class hs extends vm{constructor(t){super(t)}static setMaxAutoResolution(t,i){i?hs.maxAutoResolution.set(t,i):hs.maxAutoResolution.delete(t)}getMaxAutoResolution(){var t;let i=this.hls;return(t=hs.maxAutoResolution.get(i))!=null?t:void 0}get levels(){var t;return(t=this.hls.levels)!=null?t:[]}getValidLevels(t){return this.levels.filter((i,a)=>this.isLevelAllowed(i)&&a<=t)}getMaxLevelCapped(t){let i=this.getValidLevels(t),a=this.getMaxAutoResolution();if(!a)return super.getMaxLevel(t);let r=Hg(a);if(!r)return super.getMaxLevel(t);let n=i.filter(l=>l.width*l.height<=r),s=n.findIndex(l=>l.width*l.height===r);if(s!==-1){let l=n[s];return i.findIndex(c=>c===l)}if(n.length===0)return 0;let o=n[n.length-1];return i.findIndex(l=>l===o)}getMaxLevel(t){if(this.getMaxAutoResolution()!==void 0)return this.getMaxLevelCapped(t);let i=super.getMaxLevel(t),a=this.getValidLevels(t);if(!a[i])return i;let r=Math.min(a[i].width,a[i].height),n=hs.minMaxResolution;return r>=n?i:vm.getMaxLevelByMediaSize(a,n*(16/9),n)}};xd.minMaxResolution=720,xd.maxAutoResolution=new WeakMap;var Wg=xd,Od=Wg,Fg="com.apple.fps.1_0",Kg="application/vnd.apple.mpegurl",$g=({mediaEl:e,getAppCertificate:t,getLicenseKey:i,saveAndDispatchError:a,drmTypeCb:r})=>{if(!window.WebKitMediaKeys||!("onwebkitneedkey"in e)){console.error("No WebKitMediaKeys. FairPlay may not be supported");let d=O("Cannot play DRM-protected content with current security configuration on this browser. Try playing in another browser."),u=new M(d,M.MEDIA_ERR_ENCRYPTED,!0);return u.errorCategory=re.DRM,u.muxCode=N.ENCRYPTED_CDM_ERROR,a(e,u),()=>{}}let n=e,s=t(),o=null,l=d=>{W(null,null,function*(){try{n.webkitKeys||c();let u=yield s;if(d.initData===null||u==null)return;let m=Vg(d.initData,u);p(m)}catch(u){console.error("Could not start encrypted playback due to exception",u),a(n,u)}})},c=()=>{try{let d=new WebKitMediaKeys(Fg);n.webkitSetMediaKeys(d),r()}catch(d){let u="Cannot play DRM-protected content with current security configuration on this browser. Try playing in another browser.",m=new M(u,M.MEDIA_ERR_ENCRYPTED,!0);throw m.errorCategory=re.DRM,m.muxCode=N.ENCRYPTED_UNSUPPORTED_KEY_SYSTEM,m}},p=d=>{let u=n.webkitKeys.createSession(Kg,d),m=g=>W(null,null,function*(){try{let A=g.message,E=yield i(A);u.update(E)}catch(A){console.error("Error on FairPlay session message",A),a(e,A)}}),_=g=>{let A=g.target.error;if(!A)return;console.error(`Internal Webkit Key Session Error - sysCode: ${A.systemCode} code: ${A.code}`);let E=O("The DRM Content Decryption Module system had an internal failure. Try reloading the page, updating your browser, or playing in another browser."),T=new M(E,M.MEDIA_ERR_ENCRYPTED,!0);T.errorCategory=re.DRM,T.muxCode=N.ENCRYPTED_CDM_ERROR,a(e,T)},y=()=>{u.removeEventListener("webkitkeymessage",m),u.removeEventListener("webkitkeyerror",_),e.removeEventListener("teardown",y),"webkitCurrentPlaybackTargetIsWireless"in e&&e.removeEventListener("webkitcurrentplaybacktargetiswirelesschanged",y),o=null;try{u.close()}catch(g){}};"webkitCurrentPlaybackTargetIsWireless"in e&&e.addEventListener("webkitcurrentplaybacktargetiswirelesschanged",y,{once:!0}),u.addEventListener("webkitkeymessage",m),u.addEventListener("webkitkeyerror",_),e.addEventListener("teardown",y),o=y},v=()=>{e.removeEventListener("webkitneedkey",l),e.removeEventListener("teardown",v),o==null||o();try{n.webkitSetMediaKeys(null)}catch(d){}};return e.addEventListener("webkitneedkey",l),e.addEventListener("teardown",v,{once:!0}),v},Vg=(e,t)=>{let i=Yg(qg(e)),a=new Uint8Array(e),r=new Uint8Array(i),n=new Uint8Array(t),s=a.byteLength+4+n.byteLength+4+r.byteLength,o=new Uint8Array(s),l=0,c=v=>{o.set(v,l),l+=v.byteLength},p=v=>{let d=new DataView(o.buffer),u=v.byteLength;d.setUint32(l,u,!0),l+=4,c(v)};return c(a),p(r),p(n),o},qg=e=>new TextDecoder("utf-16le").decode(e).replace("skd://","").slice(1);function Yg(e){let t=new ArrayBuffer(e.length*2),i=new DataView(t);for(let a=0;a<e.length;a++)i.setUint16(a*2,e.charCodeAt(a),!0);return t}var Gg=({mediaEl:e,getAppCertificate:t,getLicenseKey:i,saveAndDispatchError:a,drmTypeCb:r,fallbackToWebkitFairplay:n})=>{let s=null,o=v=>W(null,null,function*(){try{let d=v.initDataType;if(d!=="skd"){console.error(`Received unexpected initialization data type "${d}"`);return}e.mediaKeys||(yield l(d));let u=v.initData;if(u==null){console.error(`Could not start encrypted playback due to missing initData in ${v.type} event`);return}yield c(d,u)}catch(d){a(e,d);return}}),l=v=>W(null,null,function*(){let d=yield navigator.requestMediaKeySystemAccess("com.apple.fps",[{initDataTypes:[v],videoCapabilities:[{contentType:"application/vnd.apple.mpegurl",robustness:""}],distinctiveIdentifier:"not-allowed",persistentState:"not-allowed",sessionTypes:["temporary"]}]).then(m=>(r(),m)).catch(()=>{let m=O("Cannot play DRM-protected content with current security configuration on this browser. Try playing in another browser."),_=new M(m,M.MEDIA_ERR_ENCRYPTED,!0);_.errorCategory=re.DRM,_.muxCode=N.ENCRYPTED_UNSUPPORTED_KEY_SYSTEM,a(e,_)});if(!d)return;let u=yield d.createMediaKeys();try{let m=yield t();yield u.setServerCertificate(m).catch(()=>{let _=O("Your server certificate failed when attempting to set it. This may be an issue with a no longer valid certificate."),y=new M(_,M.MEDIA_ERR_ENCRYPTED,!0);return y.errorCategory=re.DRM,y.muxCode=N.ENCRYPTED_UPDATE_SERVER_CERT_FAILED,Promise.reject(y)})}catch(m){a(e,m);return}yield e.setMediaKeys(u)}),c=(v,d)=>W(null,null,function*(){let u=e.mediaKeys.createSession(),m=g=>W(null,null,function*(){let A=g.message,E=yield i(A);try{yield u.update(E)}catch(T){let L=O("Failed to update DRM license. This may be an issue with the player or your protected content."),I=new M(L,M.MEDIA_ERR_ENCRYPTED,!0);I.errorCategory=re.DRM,I.muxCode=N.ENCRYPTED_UPDATE_LICENSE_FAILED,a(e,I)}}),_=()=>{let g=A=>{let E;if(A==="internal-error"){let T=O("The DRM Content Decryption Module system had an internal failure. Try reloading the page, updating your browser, or playing in another browser.");E=new M(T,M.MEDIA_ERR_ENCRYPTED,!0),E.errorCategory=re.DRM,E.muxCode=N.ENCRYPTED_CDM_ERROR}else if(A==="output-restricted"||A==="output-downscaled"){let T=O("DRM playback is being attempted in an environment that is not sufficiently secure. User may see black screen.");E=new M(T,M.MEDIA_ERR_ENCRYPTED,!1),E.errorCategory=re.DRM,E.muxCode=N.ENCRYPTED_OUTPUT_RESTRICTED}E&&a(e,E)};u.keyStatuses.forEach(A=>g(A))};u.addEventListener("keystatuseschange",_),u.addEventListener("message",m);let y=()=>W(null,null,function*(){u.removeEventListener("keystatuseschange",_),u.removeEventListener("message",m),"webkitCurrentPlaybackTargetIsWireless"in e&&e.removeEventListener("webkitcurrentplaybacktargetiswirelesschanged",y),e.removeEventListener("teardown",y),yield u.close().catch(g=>{console.warn("There was an error when closing EME session",g)}),s=null});"webkitCurrentPlaybackTargetIsWireless"in e&&e.addEventListener("webkitcurrentplaybacktargetiswirelesschanged",y,{once:!0}),e.addEventListener("teardown",y,{once:!0}),s=y,yield u.generateRequest(v,d).catch(g=>W(null,null,function*(){if(g.name==="NotSupportedError"&&"webkitCurrentPlaybackTargetIsWireless"in e&&e.webkitCurrentPlaybackTargetIsWireless)console.warn("Failed to generate a DRM license request. Attempting to fallback to Webkit DRM"),n==null||n();else{let A=O("Failed to generate a DRM license request. This may be an issue with the player or your protected content."),E=new M(A,M.MEDIA_ERR_ENCRYPTED,!0);return E.errorCategory=re.DRM,E.muxCode=N.ENCRYPTED_GENERATE_REQUEST_FAILED,console.error("Failed to generate license request",g),Promise.reject(E)}}))}),p=()=>W(null,null,function*(){e.removeEventListener("encrypted",o),e.removeEventListener("teardown",p),s&&(yield s()),yield e.setMediaKeys(null).catch(()=>{})});return e.addEventListener("encrypted",o),e.addEventListener("teardown",p,{once:!0}),p},zg=({hls:e,mediaEl:t,src:i,muxMediaState:a,saveAndDispatchError:r,maxRetries:n})=>{var s;let o,l=0,c=!1,p=!1,v=!1,d=()=>{o!=null&&(clearTimeout(o),o=void 0)},u=S=>(S==null?void 0:S.muxCode)===N.NETWORK_RECONNECTING,m=()=>!t.paused&&t.readyState<HTMLMediaElement.HAVE_FUTURE_DATA,_=()=>{let S=a.get(t);if(u(S==null?void 0:S.error))return;let H=new M(O("Attempting to reconnect..."),M.MEDIA_ERR_NETWORK,!1);H.errorCategory=re.VIDEO,H.muxCode=N.NETWORK_RECONNECTING,S&&(S.error=H),t.dispatchEvent(new CustomEvent("error",{detail:H}))},y=()=>{if(!v&&i){e.loadSource(i);return}e.startLoad(t.currentTime)},g=()=>{c=!1,p=!0,d();let S=new M(O("Network error, try reloading."),M.MEDIA_ERR_NETWORK,!0);S.errorCategory=re.VIDEO,S.reload=!0,r(t,S)},A=()=>{if(o!=null||c)return;if(l>=n){g();return}c=!0;let S=Math.min(1e3*Of(2,l),3e4);o=setTimeout(()=>{o=void 0,l+=1,y()},S)},E=()=>{let S=a.get(t);!(S!=null&&S.networkError)||p||m()&&(_(),A())},T=()=>{let S=a.get(t);S&&(S.networkError=!0),c=!1,E()},L=()=>{let S=a.get(t);S!=null&&S.networkError&&(l=0,p=!1,d(),c=!0,y())};(s=globalThis.addEventListener)==null||s.call(globalThis,"online",L);let I=()=>{let S=a.get(t);S&&(!S.networkError&&!u(S.error)||(S.networkError=!1,c=!1,l=0,p=!1,d(),S.error&&(S.error=null,t.dispatchEvent(new Event("emptied")))))};return e.on(Q.Events.FRAG_BUFFERED,I),Ae(t,"playing",()=>{let S=a.get(t);S!=null&&S.networkError&&(c=!1,l=0,p=!1,d(),S.error&&(S.error=null))}),Ae(t,"waiting",E),t.addEventListener("teardown",()=>{var S;(S=globalThis.removeEventListener)==null||S.call(globalThis,"online",L),d()},{once:!0}),{handleHlsError:(S,H)=>{var G,ne;if(S.type!==Q.ErrorTypes.NETWORK_ERROR)return!1;let z=(ne=(G=S.response)==null?void 0:G.code)!=null?ne:0;return(H.muxCode===N.NETWORK_OFFLINE||z===0||z>=500)&&S.fatal?(T(),!0):!1},onManifestLoaded:()=>{v=!0,c=!1,d()}}},ws={FAIRPLAY:"fairplay",PLAYREADY:"playready",WIDEVINE:"widevine"},Qg=e=>{if(e.includes("fps"))return ws.FAIRPLAY;if(e.includes("playready"))return ws.PLAYREADY;if(e.includes("widevine"))return ws.WIDEVINE},Zg=(e,t)=>{let i=pg(e);if(!i)return Promise.reject(new Error("No media playlist URL found in multivariant playlist"));if(kd(i)&&!t)return Promise.reject(new Error("masterPlaylistUrl is required to resolve relative media playlist URL"));let a;try{a=wd(i,t)}catch(r){return Promise.reject(r)}return fetch(a).then(r=>r.status!==200?Promise.reject(r):r.text())},jg=e=>{let t=e.split(`
`).filter(a=>a.startsWith("#EXT-X-SESSION-DATA"));if(!t.length)return{};let i={};for(let a of t){let r=Jg(a),n=r["DATA-ID"];n&&(i[n]=U({},r))}return{sessionData:i}},Xg=/([A-Z0-9-]+)="?(.*?)"?(?:,|$)/g;function Jg(e){let t=[...e.matchAll(Xg)];return Object.fromEntries(t.map(([,i,a])=>[i,a]))}var e0=e=>{var t,i,a;let r=e.split(`
`),n=(i=((t=r.find(c=>c.startsWith("#EXT-X-PLAYLIST-TYPE")))!=null?t:"").split(":")[1])==null?void 0:i.trim(),s=rm(n),o=nm(n),l;if(s===se.LIVE){let c=r.find(p=>p.startsWith("#EXT-X-PART-INF"));if(c)l=+c.split(":")[1].split("=")[1]*2;else{let p=r.find(d=>d.startsWith("#EXT-X-TARGETDURATION")),v=(a=p==null?void 0:p.split(":"))==null?void 0:a[1];l=+(v!=null?v:6)*3}}return{streamType:s,targetLiveWindow:o,liveEdgeStartOffset:l}},t0=(e,t)=>W(null,null,function*(){if(t===bi.MP4)return{streamType:se.ON_DEMAND,targetLiveWindow:Number.NaN,liveEdgeStartOffset:void 0,sessionData:void 0};if(t===bi.M3U8){let i=yield fetch(e);if(!i.ok)return Promise.reject(i);let a=yield i.text(),r=yield Zg(a,i.url);return U(U({},jg(a)),e0(r))}return console.error(`Media type ${t} is an unrecognized or unsupported type for src ${e}.`),{streamType:void 0,targetLiveWindow:void 0,liveEdgeStartOffset:void 0,sessionData:void 0}}),i0=(a,r,...n)=>W(null,[a,r,...n],function*(e,t,i=As({src:e})){var s,o,l,c;let{streamType:p,targetLiveWindow:v,liveEdgeStartOffset:d,sessionData:u}=yield t0(e,i),m=u==null?void 0:u["com.apple.hls.chapters"];(m!=null&&m.URI||m!=null&&m.VALUE.toLocaleLowerCase().startsWith("http"))&&Nd((s=m.URI)!=null?s:m.VALUE,t),((o=he.get(t))!=null?o:{}).liveEdgeStartOffset=d,((l=he.get(t))!=null?l:{}).targetLiveWindow=v,t.dispatchEvent(new CustomEvent("targetlivewindowchange",{composed:!0,bubbles:!0})),((c=he.get(t))!=null?c:{}).streamType=p,t.dispatchEvent(new CustomEvent("streamtypechange",{composed:!0,bubbles:!0}))}),Nd=(e,t)=>W(null,null,function*(){var i,a;try{let r=yield fetch(e);if(!r.ok)throw new Error(`Failed to fetch Mux metadata: ${r.status} ${r.statusText}`);let n=yield r.json(),s={};if(!((i=n==null?void 0:n[0])!=null&&i.metadata))return;for(let l of n[0].metadata)l.key&&l.value&&(s[l.key]=l.value);((a=he.get(t))!=null?a:{}).metadata=s;let o=new CustomEvent("muxmetadata");t.dispatchEvent(o)}catch(r){console.error(r)}}),a0=e=>{var t;let i=e.type,a=rm(i),r=nm(i),n,s=!!((t=e.partList)!=null&&t.length);return a===se.LIVE&&(n=s?e.partTarget*2:e.targetduration*3),{streamType:a,targetLiveWindow:r,liveEdgeStartOffset:n,lowLatency:s}},r0=(e,t,i)=>{var a,r,n,s,o,l,c,p;let{streamType:v,targetLiveWindow:d,liveEdgeStartOffset:u,lowLatency:m}=a0(e);if(v===se.LIVE){m?(i.config.backBufferLength=(a=i.userConfig.backBufferLength)!=null?a:4,i.config.maxFragLookUpTolerance=(r=i.userConfig.maxFragLookUpTolerance)!=null?r:.001,i.config.abrBandWidthUpFactor=(n=i.userConfig.abrBandWidthUpFactor)!=null?n:i.config.abrBandWidthFactor):i.config.backBufferLength=(s=i.userConfig.backBufferLength)!=null?s:8;let _=Object.freeze({get length(){return t.seekable.length},start(y){return t.seekable.start(y)},end(y){var g;return y>this.length||y<0||Number.isFinite(t.duration)?t.seekable.end(y):(g=i.liveSyncPosition)!=null?g:t.seekable.end(y)}});((o=he.get(t))!=null?o:{}).seekable=_}((l=he.get(t))!=null?l:{}).liveEdgeStartOffset=u,((c=he.get(t))!=null?c:{}).targetLiveWindow=d,t.dispatchEvent(new CustomEvent("targetlivewindowchange",{composed:!0,bubbles:!0})),((p=he.get(t))!=null?p:{}).streamType=v,t.dispatchEvent(new CustomEvent("streamtypechange",{composed:!0,bubbles:!0}))},_m,fm,Em=(fm=(_m=globalThis==null?void 0:globalThis.navigator)==null?void 0:_m.userAgent)!=null?fm:"",bm,gm,ym,n0=(ym=(gm=(bm=globalThis==null?void 0:globalThis.navigator)==null?void 0:bm.userAgentData)==null?void 0:gm.platform)!=null?ym:"",s0=Em.toLowerCase().includes("android")||["x11","android"].some(e=>n0.toLowerCase().includes(e)),o0=e=>/^((?!chrome|android).)*safari/i.test(Em)&&!!e.canPlayType("application/vnd.apple.mpegurl"),he=new WeakMap,gi="mux.com",Tm,Am,km=(Am=(Tm=Q).isSupported)==null?void 0:Am.call(Tm),l0=e=>s0||!o0(e),Ss=()=>{if(typeof window!="undefined")return Ed.utils.now()},d0=Ed.utils.generateUUID,Pd=({playbackId:e,customDomain:t=gi,maxResolution:i,minResolution:a,renditionOrder:r,programStartTime:n,programEndTime:s,assetStartTime:o,assetEndTime:l,playbackToken:c,tokens:{playback:p=c}={},extraSourceParams:v={}}={})=>{if(!e)return;let[d,u=""]=Ad(e),m=new URL(`https://stream.${t}/${d}.m3u8${u}`);return p||m.searchParams.has("token")?(m.searchParams.forEach((_,y)=>{y!="token"&&m.searchParams.delete(y)}),p&&m.searchParams.set("token",p)):(i&&m.searchParams.set("max_resolution",i),a&&(m.searchParams.set("min_resolution",a),i&&+i.slice(0,-1)<+a.slice(0,-1)&&console.error("minResolution must be <= maxResolution","minResolution",a,"maxResolution",i)),r&&m.searchParams.set("rendition_order",r),n&&m.searchParams.set("program_start_time",`${n}`),s&&m.searchParams.set("program_end_time",`${s}`),o&&m.searchParams.set("asset_start_time",`${o}`),l&&m.searchParams.set("asset_end_time",`${l}`),Object.entries(v).forEach(([_,y])=>{y!=null&&m.searchParams.set(_,y)})),m.toString()},Is=e=>{if(!e)return;let[t]=e.split("?");return t||void 0},Ud=e=>{if(!e||!e.startsWith("https://stream."))return;let[t]=new URL(e).pathname.slice(1).split(/\.m3u8|\//);return t||void 0},u0=e=>{var t,i,a;return(t=e==null?void 0:e.metadata)!=null&&t.video_id?e.metadata.video_id:xm(e)&&(a=(i=Is(e.playbackId))!=null?i:Ud(e.src))!=null?a:e.src},wm=e=>{var t;return(t=he.get(e))==null?void 0:t.error},c0=e=>{var t;return(t=he.get(e))==null?void 0:t.metadata},Bd=e=>{var t,i;return(i=(t=he.get(e))==null?void 0:t.streamType)!=null?i:se.UNKNOWN},h0=e=>{var t,i;return(i=(t=he.get(e))==null?void 0:t.targetLiveWindow)!=null?i:Number.NaN},Hd=e=>{var t,i;return(i=(t=he.get(e))==null?void 0:t.seekable)!=null?i:e.seekable},m0=e=>{var t;let i=(t=he.get(e))==null?void 0:t.liveEdgeStartOffset;if(typeof i!="number")return Number.NaN;let a=Hd(e);return a.length?a.end(a.length-1)-i:Number.NaN},p0=e=>{var t;return(t=he.get(e))==null?void 0:t.coreReference},Wd=.034,v0=(e,t,i=Wd)=>Math.abs(e-t)<=i,Sm=(e,t,i=Wd)=>e>t||v0(e,t,i),_0=(e,t=Wd)=>e.paused&&Sm(e.currentTime,e.duration,t),Im=(e,t)=>{var i,a,r;if(!t||!e.buffered.length)return;if(e.readyState>2)return!1;let n=t.currentLevel>=0?(a=(i=t.levels)==null?void 0:i[t.currentLevel])==null?void 0:a.details:(r=t.levels.find(v=>!!v.details))==null?void 0:r.details;if(!n||n.live)return;let{fragments:s}=n;if(!(s!=null&&s.length))return;if(e.currentTime<e.duration-(n.targetduration+.5))return!1;let o=s[s.length-1];if(e.currentTime<=o.start)return!1;let l=o.start+o.duration/2,c=e.buffered.start(e.buffered.length-1),p=e.buffered.end(e.buffered.length-1);return l>c&&l<p},Rm=(e,t)=>e.ended||e.loop?e.ended:t&&Im(e,t)?!0:_0(e),Lm=(e,t,i)=>{Cm(t,i,e);let{metadata:a={}}=e,{view_session_id:r=d0()}=a,n=u0(e);a.view_session_id=r,a.video_id=n,e.metadata=a;let s=d=>{var u;(u=t.mux)==null||u.emit("hb",{view_drm_type:d})};e.drmTypeCb=s,e.fallbackToWebkitFairplay=()=>W(null,null,function*(){var d;let u=!t.paused,m=t.currentTime;e.useWebkitFairplay=!0;let _=e.muxDataKeepSession;e.muxDataKeepSession=!0;let y=(d=he.get(t))==null?void 0:d.coreReference;Lm(e,t,y),e.muxDataKeepSession=_,e.useWebkitFairplay=!1,u&&(yield t.play().then(()=>{t.currentTime=m}).catch(()=>{})),t.currentTime=m}),he.set(t,{retryCount:0});let o=f0(e,t),l=kg(e,t,o);e!=null&&e.muxDataKeepSession&&t!=null&&t.mux&&!t.mux.deleted?o&&t.mux.addHLSJS({hlsjs:o,Hls:o?Q:void 0}):k0(e,t,o),w0(e,t,o),Mg(t),xg(t);let c=Ag(e,t,o);wg(e,t,o),Sg(e,t,o);let p={engine:o,setAutoplay:c,setPreload:l},v=he.get(t);return v&&(v.coreReference=p),p},Cm=(e,t,i)=>{let a=t==null?void 0:t.engine;e!=null&&e.mux&&!e.mux.deleted&&(i!=null&&i.muxDataKeepSession?a&&e.mux.removeHLSJS():(e.mux.destroy(),delete e.mux)),a&&(a.detachMedia(),a.destroy()),e&&(e.hasAttribute("src")&&(e.removeAttribute("src"),e.load()),e.removeEventListener("error",Nm),e.removeEventListener("error",Fd),e.removeEventListener("durationchange",Om),he.delete(e),e.dispatchEvent(new Event("teardown")))};function Mm(e,t){var i;let a=As(e);if(a!==bi.M3U8)return!0;let r=!a||((i=t.canPlayType(a))!=null?i:!0),{preferPlayback:n}=e,s=n===Gt.MSE,o=n===Gt.NATIVE,l=km&&(s||l0(t));return r&&(o||!l)}var f0=(e,t)=>{let{debug:i,streamType:a,startTime:r=-1,metadata:n,preferCmcd:s,_hlsConfig:o={},maxAutoResolution:l,initialBandwidthEstimateKbps:c}=e,p=As(e)===bi.M3U8,v=Mm(e,t);if(p&&!v&&km){let d=U({backBufferLength:30,renderTextTracksNatively:!1,liveDurationInfinity:!0,capLevelOnFPSDrop:!0},c!=null?{abrEwmaDefaultEstimate:c*1e3}:{}),u=E0(a),m=b0(e),_=[rn.QUERY,rn.HEADER].includes(s)?{useHeaders:s===rn.HEADER,sessionId:n==null?void 0:n.view_session_id,contentId:n==null?void 0:n.video_id}:void 0,y=A0(e,o),g=new Q(U(U(U(U(U({debug:i,startPosition:r,cmcd:_,xhrSetup:(A,E)=>{var T,L;if(s&&s!==rn.QUERY)return;let I=wd(E);if(!I.searchParams.has("CMCD"))return;let S=((L=(T=I.searchParams.get("CMCD"))==null?void 0:T.split(","))!=null?L:[]).filter(H=>H.startsWith("sid")||H.startsWith("cid")).join(",");I.searchParams.set("CMCD",S),A.open("GET",I)}},d),y),u),m),o));return y.capLevelController===Od&&l!==void 0&&Od.setMaxAutoResolution(g,l),g.on(Q.Events.MANIFEST_PARSED,function(A,E){return W(this,null,function*(){var T,L;let I=(T=E.sessionData)==null?void 0:T["com.apple.hls.chapters"];(I!=null&&I.URI||I!=null&&I.VALUE.toLocaleLowerCase().startsWith("http"))&&Nd((L=I==null?void 0:I.URI)!=null?L:I==null?void 0:I.VALUE,t)})}),g}},E0=e=>e===se.LIVE?{backBufferLength:8}:{},b0=e=>{let{tokens:{drm:t}={},playbackId:i,drmTypeCb:a}=e,r=Is(i);return!t||!r?{}:{emeEnabled:!0,drmSystems:{"com.apple.fps":{licenseUrl:Rs(e,"fairplay"),serverCertificateUrl:Dm(e,"fairplay")},"com.widevine.alpha":{licenseUrl:Rs(e,"widevine")},"com.microsoft.playready":{licenseUrl:Rs(e,"playready")}},requestMediaKeySystemAccessFunc:(n,s)=>(n==="com.widevine.alpha"&&(s=[...s.map(o=>{var l;let c=(l=o.videoCapabilities)==null?void 0:l.map(p=>da(U({},p),{robustness:"HW_SECURE_ALL"}));return da(U({},o),{videoCapabilities:c})}),...s]),navigator.requestMediaKeySystemAccess(n,s).then(o=>{let l=Qg(n);return a==null||a(l),o}))}},g0=e=>W(null,null,function*(){let t=yield fetch(e);return t.status!==200?Promise.reject(t):yield t.arrayBuffer()}),y0=(e,t)=>W(null,null,function*(){let i=yield fetch(t,{method:"POST",headers:{"Content-type":"application/octet-stream"},body:e});if(i.status!==200)return Promise.reject(i);let a=yield i.arrayBuffer();return new Uint8Array(a)}),T0=(e,t)=>{let i={mediaEl:t,getAppCertificate:()=>g0(Dm(e,"fairplay")).catch(a=>{if(a instanceof Response){let r=ks(a,re.DRM,e);return console.error("mediaError",r==null?void 0:r.message,r==null?void 0:r.context),r?Promise.reject(r):Promise.reject(new Error("Unexpected error in app cert request"))}return Promise.reject(a)}),getLicenseKey:a=>y0(a,Rs(e,"fairplay")).catch(r=>{if(r instanceof Response){let n=ks(r,re.DRM,e);return console.error("mediaError",n==null?void 0:n.message,n==null?void 0:n.context),n?Promise.reject(n):Promise.reject(new Error("Unexpected error in license key request"))}return Promise.reject(r)}),saveAndDispatchError:yi,drmTypeCb:()=>{var a;(a=e.drmTypeCb)==null||a.call(e,ws.FAIRPLAY)}};if(e.useWebkitFairplay)$g(i);else{let a=U({fallbackToWebkitFairplay:()=>W(null,null,function*(){var n;yield r(),(n=e.fallbackToWebkitFairplay)==null||n.call(e)})},i),r=Gg(a)}},Rs=({playbackId:e,tokens:{drm:t}={},customDomain:i=gi},a)=>{let r=Is(e);return`https://license.${i.toLocaleLowerCase().endsWith(gi)?i:gi}/license/${a}/${r}?token=${t}`},Dm=({playbackId:e,tokens:{drm:t}={},customDomain:i=gi},a)=>{let r=Is(e);return`https://license.${i.toLocaleLowerCase().endsWith(gi)?i:gi}/appcert/${a}/${r}?token=${t}`},xm=({playbackId:e,src:t,customDomain:i})=>{if(e)return!0;if(typeof t!="string")return!1;let a=window==null?void 0:window.location.href,r=new URL(t,a).hostname.toLocaleLowerCase();return r.includes(gi)||!!i&&r.includes(i.toLocaleLowerCase())},A0=(e,t)=>{let i={};return i.capLevelToPlayerSize=e.capRenditionToPlayerSize,i.capLevelToPlayerSize==null?(i.capLevelController=Od,i.capLevelToPlayerSize=!0):i.capLevelController=am.Rx,i},k0=(e,t,i)=>{var a;let{envKey:r,disableTracking:n,muxDataSDK:s=Ed,muxDataSDKOptions:o={}}=e,l=xm(e);if(!n&&(r||l)){let{playerInitTime:c,playerSoftwareName:p,playerSoftwareVersion:v,beaconCollectionDomain:d,debug:u,disableCookies:m}=e,_=da(U({},e.metadata),{video_title:((a=e==null?void 0:e.metadata)==null?void 0:a.video_title)||void 0}),y=g=>typeof g.player_error_code=="string"?!1:typeof e.errorTranslator=="function"?e.errorTranslator(g):g;s.monitor(t,da(U({debug:u,beaconCollectionDomain:d,hlsjs:i,Hls:i?Q:void 0,automaticErrorTracking:!1,errorTranslator:y,disableCookies:m},o),{data:U(da(U({},r?{env_key:r}:{}),{player_software_name:p,player_software:p,player_software_version:v,player_init_time:c}),_)}))}},w0=(e,t,i)=>{var a,r,n;let s=Mm(e,t),{src:o,customDomain:l=gi}=e,c=()=>{t.ended||e.disablePseudoEnded||!Rm(t,i)||(Im(t,i)?t.currentTime=t.buffered.end(t.buffered.length-1):t.dispatchEvent(new Event("ended")))},p,v,d=()=>{let u=Hd(t),m,_;u.length>0&&(m=u.start(0),_=u.end(0)),(v!==_||p!==m)&&t.dispatchEvent(new CustomEvent("seekablechange",{composed:!0})),p=m,v=_};if(Ae(t,"durationchange",d),t&&s){let u=As(e);if(typeof o=="string"){if(o.endsWith(".mp4")&&o.includes(l)){let y=Ud(o),g=new URL(`https://stream.${l}/${y}/metadata.json`);Nd(g.toString(),t)}let m=()=>{if(Bd(t)!==se.LIVE||Number.isFinite(t.duration))return;let y=setInterval(d,1e3);t.addEventListener("teardown",()=>{clearInterval(y)},{once:!0}),Ae(t,"durationchange",()=>{Number.isFinite(t.duration)&&clearInterval(y)})},_=()=>W(null,null,function*(){return i0(o,t,u).then(m).catch(y=>{if(y instanceof Response){let g=ks(y,re.VIDEO,e);if(g){yi(t,g);return}}else y instanceof Error})});if(t.preload==="none"){let y=()=>{_(),t.removeEventListener("loadedmetadata",g)},g=()=>{_(),t.removeEventListener("play",y)};Ae(t,"play",y,{once:!0}),Ae(t,"loadedmetadata",g,{once:!0})}else _();(a=e.tokens)!=null&&a.drm?T0(e,t):Ae(t,"encrypted",()=>{let y=O("Attempting to play DRM-protected content without providing a DRM token."),g=new M(y,M.MEDIA_ERR_ENCRYPTED,!0);g.errorCategory=re.DRM,g.muxCode=N.ENCRYPTED_MISSING_TOKEN,yi(t,g)},{once:!0}),t.setAttribute("src",o),e.startTime&&(((r=he.get(t))!=null?r:{}).startTime=e.startTime,t.addEventListener("durationchange",Om,{once:!0}))}else t.removeAttribute("src");t.addEventListener("error",Nm),t.addEventListener("error",Fd),t.addEventListener("emptied",()=>{t.querySelectorAll("track[data-removeondestroy]").forEach(m=>{m.remove()})},{once:!0}),Ae(t,"pause",c),Ae(t,"seeked",c),Ae(t,"play",()=>{t.ended||Sm(t.currentTime,t.duration)&&(t.currentTime=t.seekable.length?t.seekable.start(0):0)})}else if(i&&o){i.once(Q.Events.LEVEL_LOADED,(_,y)=>{r0(y.details,t,i),d(),Bd(t)===se.LIVE&&!Number.isFinite(t.duration)&&(i.on(Q.Events.LEVEL_UPDATED,d),Ae(t,"durationchange",()=>{Number.isFinite(t.duration)&&i.off(Q.Events.LEVELS_UPDATED,d)}))});let u=(n=e.maxReconnectRetries)!=null?n:0,m=u>0?zg({hls:i,mediaEl:t,src:o,muxMediaState:he,saveAndDispatchError:yi,maxRetries:u}):void 0;i.on(Q.Events.ERROR,(_,y)=>{var g,A;let E=S0(y,e);if(E.muxCode===N.NETWORK_NOT_READY){let T=(g=he.get(t))!=null?g:{},L=(A=T.retryCount)!=null?A:0;if(L<6){let I=L===0?5e3:6e4,S=new M(`Retrying in ${I/1e3} seconds...`,E.code,E.fatal);Object.assign(S,E),yi(t,S);let H=setTimeout(()=>{T.retryCount=L+1,y.details==="manifestLoadError"&&y.url&&i.loadSource(y.url)},I);t.addEventListener("teardown",()=>clearTimeout(H),{once:!0});return}else{T.retryCount=0;let I=new M("Network error, try reloading.",E.code,E.fatal);Object.assign(I,E),I.reload=!0,yi(t,I);return}}m!=null&&m.handleHlsError(y,E)||yi(t,E)}),i.on(Q.Events.MANIFEST_LOADED,()=>{m==null||m.onManifestLoaded();let _=he.get(t);_!=null&&_.networkError||_&&_.error&&(_.error=null,_.retryCount=0,t.dispatchEvent(new Event("emptied")),t.dispatchEvent(new Event("loadstart")))}),t.addEventListener("error",Fd),Ae(t,"waiting",c),Ig(e,i),Rg(t,i),i.attachMedia(t)}else console.error("It looks like the video you're trying to play will not work on this system! If possible, try upgrading to the newest versions of your browser or software.")};function Om(e){var t;let i=e.target,a=(t=he.get(i))==null?void 0:t.startTime;if(a&&hg(i.seekable,i.duration,a)){let r=i.preload==="auto";r&&(i.preload="none"),i.currentTime=a,r&&(i.preload="auto")}}function Nm(e){return W(this,null,function*(){if(!e.isTrusted)return;e.stopImmediatePropagation();let t=e.target;if(!(t!=null&&t.error))return;let{message:i,code:a}=t.error,r=new M(i,a);if(t.src&&a===M.MEDIA_ERR_SRC_NOT_SUPPORTED&&t.readyState===HTMLMediaElement.HAVE_NOTHING){setTimeout(()=>{var n;let s=(n=wm(t))!=null?n:t.error;(s==null?void 0:s.code)===M.MEDIA_ERR_SRC_NOT_SUPPORTED&&yi(t,r)},500);return}if(t.src&&(a!==M.MEDIA_ERR_DECODE||a!==void 0))try{let{status:n}=yield fetch(t.src);r.data={response:{code:n}}}catch(n){}yi(t,r)})}function yi(e,t){var i;t.fatal&&(((i=he.get(e))!=null?i:{}).error=t,e.dispatchEvent(new CustomEvent("error",{detail:t})))}function Fd(e){var t,i;if(!(e instanceof CustomEvent)||!(e.detail instanceof M))return;let a=e.target,r=e.detail;!r||!r.fatal||(((t=he.get(a))!=null?t:{}).error=r,(i=a.mux)==null||i.emit("error",{player_error_code:r.code,player_error_message:r.message,player_error_context:r.context}))}var S0=(e,t)=>{var i,a,r;e.fatal?console.error("getErrorFromHlsErrorData()",e):t.debug&&console.warn("getErrorFromHlsErrorData() (non-fatal)",e);let n={[Q.ErrorTypes.NETWORK_ERROR]:M.MEDIA_ERR_NETWORK,[Q.ErrorTypes.MEDIA_ERROR]:M.MEDIA_ERR_DECODE,[Q.ErrorTypes.KEY_SYSTEM_ERROR]:M.MEDIA_ERR_ENCRYPTED},s=p=>[Q.ErrorDetails.KEY_SYSTEM_LICENSE_REQUEST_FAILED,Q.ErrorDetails.KEY_SYSTEM_SERVER_CERTIFICATE_REQUEST_FAILED].includes(p.details)?M.MEDIA_ERR_NETWORK:n[p.type],o=p=>{if(p.type===Q.ErrorTypes.KEY_SYSTEM_ERROR)return re.DRM;if(p.type===Q.ErrorTypes.NETWORK_ERROR)return re.VIDEO},l,c=s(e);if(c===M.MEDIA_ERR_NETWORK&&e.response){let p=(i=o(e))!=null?i:re.VIDEO;l=(a=ks(e.response,p,t,e.fatal))!=null?a:new M("",c,e.fatal)}else if(c===M.MEDIA_ERR_ENCRYPTED)if(e.details===Q.ErrorDetails.KEY_SYSTEM_NO_CONFIGURED_LICENSE){let p=O("Attempting to play DRM-protected content without providing a DRM token.");l=new M(p,M.MEDIA_ERR_ENCRYPTED,e.fatal),l.errorCategory=re.DRM,l.muxCode=N.ENCRYPTED_MISSING_TOKEN}else if(e.details===Q.ErrorDetails.KEY_SYSTEM_NO_ACCESS){let p=O("Cannot play DRM-protected content with current security configuration on this browser. Try playing in another browser.");l=new M(p,M.MEDIA_ERR_ENCRYPTED,e.fatal),l.errorCategory=re.DRM,l.muxCode=N.ENCRYPTED_UNSUPPORTED_KEY_SYSTEM}else if(e.details===Q.ErrorDetails.KEY_SYSTEM_NO_SESSION){let p=O("Failed to generate a DRM license request. This may be an issue with the player or your protected content.");l=new M(p,M.MEDIA_ERR_ENCRYPTED,!0),l.errorCategory=re.DRM,l.muxCode=N.ENCRYPTED_GENERATE_REQUEST_FAILED}else if(e.details===Q.ErrorDetails.KEY_SYSTEM_SESSION_UPDATE_FAILED){let p=O("Failed to update DRM license. This may be an issue with the player or your protected content.");l=new M(p,M.MEDIA_ERR_ENCRYPTED,e.fatal),l.errorCategory=re.DRM,l.muxCode=N.ENCRYPTED_UPDATE_LICENSE_FAILED}else if(e.details===Q.ErrorDetails.KEY_SYSTEM_SERVER_CERTIFICATE_UPDATE_FAILED){let p=O("Your server certificate failed when attempting to set it. This may be an issue with a no longer valid certificate.");l=new M(p,M.MEDIA_ERR_ENCRYPTED,e.fatal),l.errorCategory=re.DRM,l.muxCode=N.ENCRYPTED_UPDATE_SERVER_CERT_FAILED}else if(e.details===Q.ErrorDetails.KEY_SYSTEM_STATUS_INTERNAL_ERROR){let p=O("The DRM Content Decryption Module system had an internal failure. Try reloading the page, updating your browser, or playing in another browser.");l=new M(p,M.MEDIA_ERR_ENCRYPTED,e.fatal),l.errorCategory=re.DRM,l.muxCode=N.ENCRYPTED_CDM_ERROR}else if(e.details===Q.ErrorDetails.KEY_SYSTEM_STATUS_OUTPUT_RESTRICTED){let p=O("DRM playback is being attempted in an environment that is not sufficiently secure. User may see black screen.");l=new M(p,M.MEDIA_ERR_ENCRYPTED,!1),l.errorCategory=re.DRM,l.muxCode=N.ENCRYPTED_OUTPUT_RESTRICTED}else l=new M(e.error.message,M.MEDIA_ERR_ENCRYPTED,e.fatal),l.errorCategory=re.DRM,l.muxCode=N.ENCRYPTED_ERROR;else l=new M("",c,e.fatal);return l.context||(l.context=`${e.url?`url: ${e.url}
`:""}${e.response&&(e.response.code||e.response.text)?`response: ${e.response.code}, ${e.response.text}
`:""}${e.reason?`failure reason: ${e.reason}
`:""}${e.level?`level: ${e.level}
`:""}${e.parent?`parent stream controller: ${e.parent}
`:""}${e.buffer?`buffer length: ${e.buffer}
`:""}${e.error?`error: ${e.error}
`:""}${e.event?`event: ${e.event}
`:""}${e.err?`error message: ${(r=e.err)==null?void 0:r.message}
`:""}`),l.data=e,l},Ls=$(61121),Pm=e=>{throw TypeError(e)},Kd=(e,t,i)=>t.has(e)||Pm("Cannot "+i),Re=(e,t,i)=>(Kd(e,t,"read from private field"),i?i.call(e):t.get(e)),Et=(e,t,i)=>t.has(e)?Pm("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,i),Mt=(e,t,i,a)=>(Kd(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),Cs=(e,t,i)=>(Kd(e,t,"access private method"),i),I0=()=>{try{return"0.31.2"}catch(e){}return"UNKNOWN"},R0=I0(),L0=()=>R0,C0=`
<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" part="logo" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2" viewBox="0 0 1600 500"><g fill="#fff"><path d="M994.287 93.486c-17.121 0-31-13.879-31-31 0-17.121 13.879-31 31-31 17.121 0 31 13.879 31 31 0 17.121-13.879 31-31 31m0-93.486c-34.509 0-62.484 27.976-62.484 62.486v187.511c0 68.943-56.09 125.033-125.032 125.033s-125.03-56.09-125.03-125.033V62.486C681.741 27.976 653.765 0 619.256 0s-62.484 27.976-62.484 62.486v187.511C556.772 387.85 668.921 500 806.771 500c137.851 0 250.001-112.15 250.001-250.003V62.486c0-34.51-27.976-62.486-62.485-62.486M1537.51 468.511c-17.121 0-31-13.879-31-31 0-17.121 13.879-31 31-31 17.121 0 31 13.879 31 31 0 17.121-13.879 31-31 31m-275.883-218.509-143.33 143.329c-24.402 24.402-24.402 63.966 0 88.368 24.402 24.402 63.967 24.402 88.369 0l143.33-143.329 143.328 143.329c24.402 24.4 63.967 24.402 88.369 0 24.403-24.402 24.403-63.966.001-88.368l-143.33-143.329.001-.004 143.329-143.329c24.402-24.402 24.402-63.965 0-88.367s-63.967-24.402-88.369 0L1349.996 161.63 1206.667 18.302c-24.402-24.401-63.967-24.402-88.369 0s-24.402 63.965 0 88.367l143.329 143.329v.004ZM437.511 468.521c-17.121 0-31-13.879-31-31 0-17.121 13.879-31 31-31 17.121 0 31 13.879 31 31 0 17.121-13.879 31-31 31M461.426 4.759C438.078-4.913 411.2.432 393.33 18.303L249.999 161.632 106.669 18.303C88.798.432 61.922-4.913 38.573 4.759 15.224 14.43-.001 37.214-.001 62.488v375.026c0 34.51 27.977 62.486 62.487 62.486 34.51 0 62.486-27.976 62.486-62.486V213.341l80.843 80.844c24.404 24.402 63.965 24.402 88.369 0l80.843-80.844v224.173c0 34.51 27.976 62.486 62.486 62.486s62.486-27.976 62.486-62.486V62.488c0-25.274-15.224-48.058-38.573-57.729" style="fill-rule:nonzero"/></g></svg>`,f={BEACON_COLLECTION_DOMAIN:"beacon-collection-domain",CUSTOM_DOMAIN:"custom-domain",DEBUG:"debug",DISABLE_TRACKING:"disable-tracking",DISABLE_COOKIES:"disable-cookies",DISABLE_PSEUDO_ENDED:"disable-pseudo-ended",MAX_RECONNECT_RETRIES:"max-reconnect-retries",DRM_TOKEN:"drm-token",PLAYBACK_TOKEN:"playback-token",ENV_KEY:"env-key",MAX_RESOLUTION:"max-resolution",MIN_RESOLUTION:"min-resolution",MAX_AUTO_RESOLUTION:"max-auto-resolution",RENDITION_ORDER:"rendition-order",PROGRAM_START_TIME:"program-start-time",PROGRAM_END_TIME:"program-end-time",ASSET_START_TIME:"asset-start-time",ASSET_END_TIME:"asset-end-time",METADATA_URL:"metadata-url",PLAYBACK_ID:"playback-id",PLAYER_SOFTWARE_NAME:"player-software-name",PLAYER_SOFTWARE_VERSION:"player-software-version",PLAYER_INIT_TIME:"player-init-time",PREFER_CMCD:"prefer-cmcd",PREFER_PLAYBACK:"prefer-playback",START_TIME:"start-time",STREAM_TYPE:"stream-type",TARGET_LIVE_WINDOW:"target-live-window",LIVE_EDGE_OFFSET:"live-edge-offset",TYPE:"type",LOGO:"logo",CAP_RENDITION_TO_PLAYER_SIZE:"cap-rendition-to-player-size",INITIAL_BANDWIDTH_ESTIMATE_KBPS:"initial-bandwidth-estimate-kbps",INITIAL_ESTIMATE_SEGMENTS:"initial-estimate-segments",MIN_PRELOAD_SEGMENTS:"min-preload-segments"},M0=Object.values(f),Um=L0(),Bm="mux-video",on,Ms,ln,Ds,xs,Os,Ns,Ps,dn,Us,bt,_a,Bs,un,D0=class extends Ls.lB{constructor(){super(),Et(this,bt),Et(this,on),Et(this,Ms),Et(this,ln,{}),Et(this,Ds,{}),Et(this,xs),Et(this,Os),Et(this,Ns),Et(this,Ps),Et(this,dn,""),Et(this,Us,e=>{var t;let i=c0(this.nativeEl),a=(t=this.metadata)!=null?t:{};this.metadata=U(U({},i),a),(i==null?void 0:i["com.mux.video.branding"])==="mux-free-plan"&&(Mt(this,dn,"default"),this.updateLogo())}),Et(this,Bs),Mt(this,Ms,Ss())}static get NAME(){return Bm}static get VERSION(){return Um}static get observedAttributes(){var e;return[...M0,...(e=Ls.lB.observedAttributes)!=null?e:[]]}static getLogoHTML(e){return!e||e==="false"?"":e==="default"?C0:`<img part="logo" src="${e}" />`}static getTemplateHTML(e={}){var t;return`
      ${Ls.lB.getTemplateHTML(e)}
      <style>
        :host {
          position: relative;
        }
        slot[name="logo"] {
          display: flex;
          justify-content: end;
          position: absolute;
          top: 1rem;
          right: 1rem;
          opacity: 0;
          transition: opacity 0.25s ease-in-out;
          z-index: 1;
        }
        slot[name="logo"]:has([part="logo"]) {
          opacity: 1;
        }
        slot[name="logo"] [part="logo"] {
          width: 5rem;
          pointer-events: none;
          user-select: none;
        }
      </style>
      <slot name="logo">
        ${this.getLogoHTML((t=e[f.LOGO])!=null?t:"")}
      </slot>
    `}get preferCmcd(){var e;return(e=this.getAttribute(f.PREFER_CMCD))!=null?e:void 0}set preferCmcd(e){e!==this.preferCmcd&&(e?Ts.includes(e)?this.setAttribute(f.PREFER_CMCD,e):console.warn(`Invalid value for preferCmcd. Must be one of ${Ts.join()}`):this.removeAttribute(f.PREFER_CMCD))}get playerInitTime(){return this.hasAttribute(f.PLAYER_INIT_TIME)?+this.getAttribute(f.PLAYER_INIT_TIME):Re(this,Ms)}set playerInitTime(e){e!=this.playerInitTime&&(e==null?this.removeAttribute(f.PLAYER_INIT_TIME):this.setAttribute(f.PLAYER_INIT_TIME,`${+e}`))}get playerSoftwareName(){var e;return(e=Re(this,Ns))!=null?e:Bm}set playerSoftwareName(e){Mt(this,Ns,e)}get playerSoftwareVersion(){var e;return(e=Re(this,Os))!=null?e:Um}set playerSoftwareVersion(e){Mt(this,Os,e)}get _hls(){var e;return(e=Re(this,bt,_a))==null?void 0:e.engine}get mux(){var e;return(e=this.nativeEl)==null?void 0:e.mux}get error(){var e;return(e=wm(this.nativeEl))!=null?e:null}get errorTranslator(){return Re(this,Ps)}set errorTranslator(e){Mt(this,Ps,e)}get src(){return this.getAttribute("src")}set src(e){e!==this.src&&(e==null?this.removeAttribute("src"):this.setAttribute("src",e))}get type(){var e;return(e=this.getAttribute(f.TYPE))!=null?e:void 0}set type(e){e!==this.type&&(e?this.setAttribute(f.TYPE,e):this.removeAttribute(f.TYPE))}get preload(){let e=this.getAttribute("preload");return e===""?"auto":["none","metadata","auto"].includes(e)?e:super.preload}set preload(e){e!=this.getAttribute("preload")&&(["","none","metadata","auto"].includes(e)?this.setAttribute("preload",e):this.removeAttribute("preload"))}get debug(){return this.getAttribute(f.DEBUG)!=null}set debug(e){e!==this.debug&&(e?this.setAttribute(f.DEBUG,""):this.removeAttribute(f.DEBUG))}get disableTracking(){return this.hasAttribute(f.DISABLE_TRACKING)}set disableTracking(e){e!==this.disableTracking&&this.toggleAttribute(f.DISABLE_TRACKING,!!e)}get disableCookies(){return this.hasAttribute(f.DISABLE_COOKIES)}set disableCookies(e){e!==this.disableCookies&&(e?this.setAttribute(f.DISABLE_COOKIES,""):this.removeAttribute(f.DISABLE_COOKIES))}get disablePseudoEnded(){return this.hasAttribute(f.DISABLE_PSEUDO_ENDED)}set disablePseudoEnded(e){e!==this.disablePseudoEnded&&(e?this.setAttribute(f.DISABLE_PSEUDO_ENDED,""):this.removeAttribute(f.DISABLE_PSEUDO_ENDED))}get maxReconnectRetries(){let e=this.getAttribute(f.MAX_RECONNECT_RETRIES);if(e==null)return;let t=+e;return Number.isNaN(t)?void 0:t}set maxReconnectRetries(e){e!==this.maxReconnectRetries&&(e==null?this.removeAttribute(f.MAX_RECONNECT_RETRIES):this.setAttribute(f.MAX_RECONNECT_RETRIES,`${e}`))}get startTime(){let e=this.getAttribute(f.START_TIME);if(e==null)return;let t=+e;return Number.isNaN(t)?void 0:t}set startTime(e){e!==this.startTime&&(e==null?this.removeAttribute(f.START_TIME):this.setAttribute(f.START_TIME,`${e}`))}get initialBandwidthEstimateKbps(){let e=this.getAttribute(f.INITIAL_BANDWIDTH_ESTIMATE_KBPS);if(e==null)return;let t=+e;return Number.isNaN(t)?void 0:t}set initialBandwidthEstimateKbps(e){e!==this.initialBandwidthEstimateKbps&&(e==null?this.removeAttribute(f.INITIAL_BANDWIDTH_ESTIMATE_KBPS):this.setAttribute(f.INITIAL_BANDWIDTH_ESTIMATE_KBPS,`${e}`))}get initialEstimateSegments(){let e=this.getAttribute(f.INITIAL_ESTIMATE_SEGMENTS);if(e==null)return;let t=+e;return Number.isNaN(t)?void 0:t}set initialEstimateSegments(e){e!==this.initialEstimateSegments&&(e==null?this.removeAttribute(f.INITIAL_ESTIMATE_SEGMENTS):this.setAttribute(f.INITIAL_ESTIMATE_SEGMENTS,`${e}`))}get minPreloadSegments(){let e=this.getAttribute(f.MIN_PRELOAD_SEGMENTS);if(e==null)return;let t=+e;return Number.isNaN(t)?void 0:t}set minPreloadSegments(e){e!==this.minPreloadSegments&&(e==null?this.removeAttribute(f.MIN_PRELOAD_SEGMENTS):this.setAttribute(f.MIN_PRELOAD_SEGMENTS,`${e}`))}get playbackId(){var e;return this.hasAttribute(f.PLAYBACK_ID)?this.getAttribute(f.PLAYBACK_ID):(e=Ud(this.src))!=null?e:void 0}set playbackId(e){e!==this.playbackId&&(e?this.setAttribute(f.PLAYBACK_ID,e):this.removeAttribute(f.PLAYBACK_ID))}get maxResolution(){var e;return(e=this.getAttribute(f.MAX_RESOLUTION))!=null?e:void 0}set maxResolution(e){e!==this.maxResolution&&(e?this.setAttribute(f.MAX_RESOLUTION,e):this.removeAttribute(f.MAX_RESOLUTION))}get minResolution(){var e;return(e=this.getAttribute(f.MIN_RESOLUTION))!=null?e:void 0}set minResolution(e){e!==this.minResolution&&(e?this.setAttribute(f.MIN_RESOLUTION,e):this.removeAttribute(f.MIN_RESOLUTION))}get maxAutoResolution(){var e;return(e=this.getAttribute(f.MAX_AUTO_RESOLUTION))!=null?e:void 0}set maxAutoResolution(e){e==null?this.removeAttribute(f.MAX_AUTO_RESOLUTION):this.setAttribute(f.MAX_AUTO_RESOLUTION,e)}get renditionOrder(){var e;return(e=this.getAttribute(f.RENDITION_ORDER))!=null?e:void 0}set renditionOrder(e){e!==this.renditionOrder&&(e?this.setAttribute(f.RENDITION_ORDER,e):this.removeAttribute(f.RENDITION_ORDER))}get programStartTime(){let e=this.getAttribute(f.PROGRAM_START_TIME);if(e==null)return;let t=+e;return Number.isNaN(t)?void 0:t}set programStartTime(e){e==null?this.removeAttribute(f.PROGRAM_START_TIME):this.setAttribute(f.PROGRAM_START_TIME,`${e}`)}get programEndTime(){let e=this.getAttribute(f.PROGRAM_END_TIME);if(e==null)return;let t=+e;return Number.isNaN(t)?void 0:t}set programEndTime(e){e==null?this.removeAttribute(f.PROGRAM_END_TIME):this.setAttribute(f.PROGRAM_END_TIME,`${e}`)}get assetStartTime(){let e=this.getAttribute(f.ASSET_START_TIME);if(e==null)return;let t=+e;return Number.isNaN(t)?void 0:t}set assetStartTime(e){e==null?this.removeAttribute(f.ASSET_START_TIME):this.setAttribute(f.ASSET_START_TIME,`${e}`)}get assetEndTime(){let e=this.getAttribute(f.ASSET_END_TIME);if(e==null)return;let t=+e;return Number.isNaN(t)?void 0:t}set assetEndTime(e){e==null?this.removeAttribute(f.ASSET_END_TIME):this.setAttribute(f.ASSET_END_TIME,`${e}`)}get customDomain(){var e;return(e=this.getAttribute(f.CUSTOM_DOMAIN))!=null?e:void 0}set customDomain(e){e!==this.customDomain&&(e?this.setAttribute(f.CUSTOM_DOMAIN,e):this.removeAttribute(f.CUSTOM_DOMAIN))}get capRenditionToPlayerSize(){var e;return((e=this._hlsConfig)==null?void 0:e.capLevelToPlayerSize)!=null?this._hlsConfig.capLevelToPlayerSize:Re(this,Bs)}set capRenditionToPlayerSize(e){Mt(this,Bs,e)}get drmToken(){var e;return(e=this.getAttribute(f.DRM_TOKEN))!=null?e:void 0}set drmToken(e){e!==this.drmToken&&(e?this.setAttribute(f.DRM_TOKEN,e):this.removeAttribute(f.DRM_TOKEN))}get playbackToken(){var e,t,i,a;if(this.hasAttribute(f.PLAYBACK_TOKEN))return(e=this.getAttribute(f.PLAYBACK_TOKEN))!=null?e:void 0;if(this.hasAttribute(f.PLAYBACK_ID)){let[,r]=Ad((t=this.playbackId)!=null?t:"");return(i=new URLSearchParams(r).get("token"))!=null?i:void 0}if(this.src)return(a=new URLSearchParams(this.src).get("token"))!=null?a:void 0}set playbackToken(e){e!==this.playbackToken&&(e?this.setAttribute(f.PLAYBACK_TOKEN,e):this.removeAttribute(f.PLAYBACK_TOKEN))}get tokens(){let e=this.getAttribute(f.PLAYBACK_TOKEN),t=this.getAttribute(f.DRM_TOKEN);return U(U(U({},Re(this,Ds)),e!=null?{playback:e}:{}),t!=null?{drm:t}:{})}set tokens(e){Mt(this,Ds,e!=null?e:{})}get ended(){return Rm(this.nativeEl,this._hls)}get envKey(){var e;return(e=this.getAttribute(f.ENV_KEY))!=null?e:void 0}set envKey(e){e!==this.envKey&&(e?this.setAttribute(f.ENV_KEY,e):this.removeAttribute(f.ENV_KEY))}get beaconCollectionDomain(){var e;return(e=this.getAttribute(f.BEACON_COLLECTION_DOMAIN))!=null?e:void 0}set beaconCollectionDomain(e){e!==this.beaconCollectionDomain&&(e?this.setAttribute(f.BEACON_COLLECTION_DOMAIN,e):this.removeAttribute(f.BEACON_COLLECTION_DOMAIN))}get streamType(){var e;return(e=this.getAttribute(f.STREAM_TYPE))!=null?e:Bd(this.nativeEl)}set streamType(e){e!==this.streamType&&(e?this.setAttribute(f.STREAM_TYPE,e):this.removeAttribute(f.STREAM_TYPE))}get targetLiveWindow(){return this.hasAttribute(f.TARGET_LIVE_WINDOW)?+this.getAttribute(f.TARGET_LIVE_WINDOW):h0(this.nativeEl)}set targetLiveWindow(e){e!=this.targetLiveWindow&&(e==null?this.removeAttribute(f.TARGET_LIVE_WINDOW):this.setAttribute(f.TARGET_LIVE_WINDOW,`${+e}`))}get liveEdgeStart(){var e,t;if(this.hasAttribute(f.LIVE_EDGE_OFFSET)){let{liveEdgeOffset:i}=this,a=(e=this.nativeEl.seekable.end(0))!=null?e:0,r=(t=this.nativeEl.seekable.start(0))!=null?t:0;return Math.max(r,a-i)}return m0(this.nativeEl)}get liveEdgeOffset(){if(this.hasAttribute(f.LIVE_EDGE_OFFSET))return+this.getAttribute(f.LIVE_EDGE_OFFSET)}set liveEdgeOffset(e){e!=this.liveEdgeOffset&&(e==null?this.removeAttribute(f.LIVE_EDGE_OFFSET):this.setAttribute(f.LIVE_EDGE_OFFSET,`${+e}`))}get seekable(){return Hd(this.nativeEl)}addCuePoints(e){return W(this,null,function*(){return this.nativeEl.currentSrc||console.warn("addCuePoints() was called before the media element has loaded. Wait for the loadstart event before calling addCuePoints()."),um(this.nativeEl,e)})}get activeCuePoint(){return cm(this.nativeEl)}get cuePoints(){return Cg(this.nativeEl)}addChapters(e){return W(this,null,function*(){return this.nativeEl.currentSrc||console.warn("addChapters() was called before the media element has loaded. Wait for the loadstart event before calling addChapters()."),mm(this.nativeEl,e)})}get activeChapter(){return pm(this.nativeEl)}get chapters(){return Dg(this.nativeEl)}getStartDate(){return Og(this.nativeEl,this._hls)}get currentPdt(){return Ng(this.nativeEl,this._hls)}get preferPlayback(){let e=this.getAttribute(f.PREFER_PLAYBACK);if(e===Gt.MSE||e===Gt.NATIVE)return e}set preferPlayback(e){e!==this.preferPlayback&&(e===Gt.MSE||e===Gt.NATIVE?this.setAttribute(f.PREFER_PLAYBACK,e):this.removeAttribute(f.PREFER_PLAYBACK))}get metadata(){return U(U({},this.getAttributeNames().filter(e=>e.startsWith("metadata-")&&![f.METADATA_URL].includes(e)).reduce((e,t)=>{let i=this.getAttribute(t);return i!=null&&(e[t.replace(/^metadata-/,"").replace(/-/g,"_")]=i),e},{})),Re(this,ln))}set metadata(e){Mt(this,ln,e!=null?e:{}),this.mux&&this.mux.emit("hb",Re(this,ln))}get _hlsConfig(){return Re(this,xs)}set _hlsConfig(e){Mt(this,xs,e)}get logo(){var e;return(e=this.getAttribute(f.LOGO))!=null?e:Re(this,dn)}set logo(e){e?this.setAttribute(f.LOGO,e):this.removeAttribute(f.LOGO)}load(){Lm(this,this.nativeEl,Re(this,bt,_a))}unload(){Cm(this.nativeEl,Re(this,bt,_a),this)}attributeChangedCallback(e,t,i){var a,r;switch(Ls.lB.observedAttributes.includes(e)&&!["src","autoplay","preload"].includes(e)&&super.attributeChangedCallback(e,t,i),e){case f.PLAYER_SOFTWARE_NAME:this.playerSoftwareName=i!=null?i:void 0;break;case f.PLAYER_SOFTWARE_VERSION:this.playerSoftwareVersion=i!=null?i:void 0;break;case"src":{let n=!!t,s=!!i;!n&&s?Cs(this,bt,un).call(this):n&&!s?this.unload():n&&s&&(this.unload(),Cs(this,bt,un).call(this));break}case"autoplay":if(i===t)break;(a=Re(this,bt,_a))==null||a.setAutoplay(this.autoplay);break;case"preload":if(i===t)break;(r=Re(this,bt,_a))==null||r.setPreload(i);break;case f.PLAYBACK_ID:case f.CUSTOM_DOMAIN:case f.MAX_RESOLUTION:case f.MIN_RESOLUTION:case f.RENDITION_ORDER:case f.PROGRAM_START_TIME:case f.PROGRAM_END_TIME:case f.ASSET_START_TIME:case f.ASSET_END_TIME:case f.PLAYBACK_TOKEN:this.src=Pd(this);break;case f.DEBUG:{let n=this.debug;this.mux&&console.info("Cannot toggle debug mode of mux data after initialization. Make sure you set all metadata to override before setting the src."),this._hls&&(this._hls.config.debug=n);break}case f.METADATA_URL:i&&fetch(i).then(n=>n.json()).then(n=>this.metadata=n).catch(()=>console.error(`Unable to load or parse metadata JSON from metadata-url ${i}!`));break;case f.STREAM_TYPE:(i==null||i!==t)&&this.dispatchEvent(new CustomEvent("streamtypechange",{composed:!0,bubbles:!0}));break;case f.TARGET_LIVE_WINDOW:(i==null||i!==t)&&this.dispatchEvent(new CustomEvent("targetlivewindowchange",{composed:!0,bubbles:!0,detail:this.targetLiveWindow}));break;case f.LOGO:(i==null||i!==t)&&this.updateLogo();break;case f.DISABLE_TRACKING:{if(i==null||i!==t){let n=this.currentTime,s=this.paused;this.unload(),Cs(this,bt,un).call(this).then(()=>{this.currentTime=n,s||this.play()})}break}case f.DISABLE_COOKIES:{(i==null||i!==t)&&this.disableCookies&&document.cookie.split(";").forEach(n=>{n.trim().startsWith("muxData")&&(document.cookie=n.replace(/^ +/,"").replace(/=.*/,"=;expires="+new Date().toUTCString()+";path=/"))});break}case f.CAP_RENDITION_TO_PLAYER_SIZE:(i==null||i!==t)&&(this.capRenditionToPlayerSize=i!=null?!0:void 0)}}updateLogo(){if(!this.shadowRoot)return;let e=this.shadowRoot.querySelector('slot[name="logo"]');if(!e)return;let t=this.constructor.getLogoHTML(Re(this,dn)||this.logo);e.innerHTML=t}connectedCallback(){var e,t;(e=super.connectedCallback)==null||e.call(this),(t=this.nativeEl)==null||t.addEventListener("muxmetadata",Re(this,Us)),this.nativeEl&&this.src&&!Re(this,bt,_a)&&Cs(this,bt,un).call(this)}disconnectedCallback(){var e,t;(e=this.nativeEl)==null||e.removeEventListener("muxmetadata",Re(this,Us)),this.unload(),(t=super.disconnectedCallback)==null||t.call(this)}handleEvent(e){e.target===this.nativeEl&&this.dispatchEvent(new CustomEvent(e.type,{composed:!0,detail:e.detail}))}};on=new WeakMap,Ms=new WeakMap,ln=new WeakMap,Ds=new WeakMap,xs=new WeakMap,Os=new WeakMap,Ns=new WeakMap,Ps=new WeakMap,dn=new WeakMap,Us=new WeakMap,bt=new WeakSet,_a=function(){return p0(this.nativeEl)},Bs=new WeakMap,un=function(){return W(this,null,function*(){Re(this,on)||(yield Mt(this,on,Promise.resolve()),Mt(this,on,null),this.load())})};const Hi=new WeakMap;class $d extends Error{}class x0 extends Error{}class Mw extends null{}const O0=["application/x-mpegURL","application/vnd.apple.mpegurl","audio/mpegurl"],N0=globalThis.WeakRef?class extends Set{add(e){super.add(new WeakRef(e))}forEach(e){super.forEach(t=>{const i=t.deref();i&&e(i)})}}:Set;function P0(e){var t,i,a;(i=(t=globalThis.chrome)==null?void 0:t.cast)!=null&&i.isAvailable?(a=globalThis.cast)!=null&&a.framework?e():customElements.whenDefined("google-cast-button").then(e):globalThis.__onGCastApiAvailable=()=>{customElements.whenDefined("google-cast-button").then(e)}}function U0(){return globalThis.chrome}function B0(){var i;const e="https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1";if((i=globalThis.chrome)!=null&&i.cast||document.querySelector(`script[src="${e}"]`))return;const t=document.createElement("script");t.src=e,document.head.append(t)}function Wi(){var e,t;return(t=(e=globalThis.cast)==null?void 0:e.framework)==null?void 0:t.CastContext.getInstance()}function Vd(){var e;return(e=Wi())==null?void 0:e.getCurrentSession()}function qd(){var e;return(e=Vd())==null?void 0:e.getSessionObj().media[0]}function H0(e){return new Promise((t,i)=>{qd().editTracksInfo(e,t,i)})}function W0(e){return new Promise((t,i)=>{qd().getStatus(e,t,i)})}function Hm(e){return Wi().setOptions(U(U({},Wm()),e))}function Wm(){return{receiverApplicationId:"CC1AD845",autoJoinPolicy:"origin_scoped",androidReceiverCompatible:!1,language:"en-US",resumeSavedSession:!0}}function Fm(e){if(!e)return;const t=/\.([a-zA-Z0-9]+)(?:\?.*)?$/,i=e.match(t);return i?i[1]:null}function F0(e){for(const t of e.split(`
`)){const i=t.trim();if(i.startsWith("#EXT-X-MEDIA")&&/TYPE=AUDIO/i.test(i)){const a=i.match(/URI="([^"]+)"/i);if(a)return a[1]}}}function K0(e){const t=e.split(`
`),i=[];for(let a=0;a<t.length;a++)if(t[a].trim().startsWith("#EXT-X-STREAM-INF")){const n=t[a+1]?t[a+1].trim():"";n&&!n.startsWith("#")&&i.push(n)}return i}function Km(e){const i=e.split(`
`).find(a=>!a.trim().startsWith("#")&&a.trim()!=="");return i==null?void 0:i.trim()}function $0(e){return W(this,null,function*(){if(!e)return!1;if(/\.m3u8?(\?.*)?$/i.test(e))return!0;if(e.startsWith("blob:"))return!1;try{const i=(yield fetch(e,{method:"HEAD"})).headers.get("Content-Type");return O0.some(a=>i===a)}catch(t){return console.error("Error while trying to get the Content-Type of the manifest",t),!1}})}function V0(e){return W(this,null,function*(){var t;if(!e||e.startsWith("blob:"))return{videoFormat:void 0,audioFormat:void 0};try{const i=yield(yield fetch(e)).text();let a=i;const r=K0(i);if(r.length>0){const c=new URL(r[0],e).toString();a=yield(yield fetch(c)).text()}const n=Km(a),s=Fm(n),o=F0(i);let l=s;if(o)try{const c=new URL(o,e).toString(),p=yield(yield fetch(c)).text(),v=Km(p);l=(t=Fm(v))!=null?t:s}catch(c){console.error("Error while trying to parse the audio rendition playlist",c)}return{videoFormat:s,audioFormat:l}}catch(i){return console.error("Error while trying to parse the manifest playlist",i),{videoFormat:void 0,audioFormat:void 0}}})}const Hs=new N0,Ti=new WeakSet;let Ne;P0(()=>{var e,t,i,a;if(!((t=(e=globalThis.chrome)==null?void 0:e.cast)!=null&&t.isAvailable)){console.debug("chrome.cast.isAvailable",(a=(i=globalThis.chrome)==null?void 0:i.cast)==null?void 0:a.isAvailable);return}Ne||(Ne=cast.framework,Wi().addEventListener(Ne.CastContextEventType.CAST_STATE_CHANGED,r=>{Hs.forEach(n=>{var s,o;return(o=(s=Hi.get(n)).onCastStateChanged)==null?void 0:o.call(s,r)})}),Wi().addEventListener(Ne.CastContextEventType.SESSION_STATE_CHANGED,r=>{Hs.forEach(n=>{var s,o;return(o=(s=Hi.get(n)).onSessionStateChanged)==null?void 0:o.call(s,r)})}),Hs.forEach(r=>{var n,s;return(s=(n=Hi.get(r)).init)==null?void 0:s.call(n)}))});let $m=0;class q0 extends EventTarget{constructor(i){super();Ze(this,pe);Ze(this,ee);Ze(this,Vr);Ze(this,Je);Ze(this,Ft);Ze(this,Pa,"disconnected");Ze(this,Ua,!1);Ze(this,la,new Set);Ze(this,td,new WeakMap);Ze(this,ds,()=>It(this,pe,Rh).call(this));lt(this,ee,i),Hs.add(this),Hi.set(this,{init:()=>It(this,pe,Ih).call(this),onCastStateChanged:()=>It(this,pe,Sh).call(this),onSessionStateChanged:()=>It(this,pe,Bf).call(this),getCastPlayer:()=>k(this,pe,Ha)}),It(this,pe,Ih).call(this)}destroy(){var i,a,r;(a=(i=k(this,ee))==null?void 0:i.textTracks)==null||a.removeEventListener("change",k(this,ds)),k(this,Ft)&&((r=k(this,Je))!=null&&r.controller)&&Object.entries(k(this,Ft)).forEach(([n,s])=>{k(this,Je).controller.removeEventListener(n,s)}),k(this,ee)&&Ti.delete(k(this,ee)),lt(this,Vr,!1)}get state(){return k(this,Pa)}watchAvailability(i){return W(this,null,function*(){if(k(this,ee).disableRemotePlayback)throw new $d("disableRemotePlayback attribute is present.");return k(this,td).set(i,++$m),k(this,la).add(i),queueMicrotask(()=>i(It(this,pe,Uf).call(this))),$m})}cancelWatchAvailability(i){return W(this,null,function*(){if(k(this,ee).disableRemotePlayback)throw new $d("disableRemotePlayback attribute is present.");i?k(this,la).delete(i):k(this,la).clear()})}prompt(){return W(this,null,function*(){var a,r,n,s;if(k(this,ee).disableRemotePlayback)throw new $d("disableRemotePlayback attribute is present.");if(!((r=(a=globalThis.chrome)==null?void 0:a.cast)!=null&&r.isAvailable))throw new x0("The RemotePlayback API is disabled on this platform.");const i=Ti.has(k(this,ee));Ti.add(k(this,ee)),Hm(k(this,ee).castOptions),Object.entries(k(this,Ft)).forEach(([o,l])=>{k(this,Je).controller.addEventListener(o,l)});try{yield Wi().requestSession()}catch(o){if(i||Ti.delete(k(this,ee)),o==="cancel")return;throw new Error(o)}(s=(n=Hi.get(k(this,ee)))==null?void 0:n.loadOnPrompt)==null||s.call(n)})}}ee=new WeakMap,Vr=new WeakMap,Je=new WeakMap,Ft=new WeakMap,Pa=new WeakMap,Ua=new WeakMap,la=new WeakMap,td=new WeakMap,ds=new WeakMap,pe=new WeakSet,Ha=function(){if(Ti.has(k(this,ee)))return k(this,Je)},Pf=function(){Ti.has(k(this,ee))&&(Object.entries(k(this,Ft)).forEach(([i,a])=>{k(this,Je).controller.removeEventListener(i,a)}),Ti.delete(k(this,ee)),k(this,ee).muted=k(this,Je).isMuted,k(this,ee).currentTime=k(this,Je).savedPlayerState.currentTime,k(this,Je).savedPlayerState.isPaused===!1&&k(this,ee).play())},Uf=function(){var a;const i=(a=Wi())==null?void 0:a.getCastState();return i&&i!=="NO_DEVICES_AVAILABLE"},Sh=function(){const i=Wi().getCastState();if(Ti.has(k(this,ee))&&i==="CONNECTING"&&(lt(this,Pa,"connecting"),this.dispatchEvent(new Event("connecting"))),!k(this,Ua)&&(i!=null&&i.includes("CONNECT"))){lt(this,Ua,!0);for(let a of k(this,la))a(!0)}else if(k(this,Ua)&&(!i||i==="NO_DEVICES_AVAILABLE")){lt(this,Ua,!1);for(let a of k(this,la))a(!1)}},Bf=function(){return W(this,null,function*(){var a;const{SESSION_RESUMED:i}=Ne.SessionState;if(Wi().getSessionState()===i&&k(this,ee).castSrc===((a=qd())==null?void 0:a.media.contentId)){Ti.add(k(this,ee)),Object.entries(k(this,Ft)).forEach(([r,n])=>{k(this,Je).controller.addEventListener(r,n)});try{yield W0(new chrome.cast.media.GetStatusRequest)}catch(r){console.error(r)}k(this,Ft)[Ne.RemotePlayerEventType.IS_PAUSED_CHANGED](),k(this,Ft)[Ne.RemotePlayerEventType.PLAYER_STATE_CHANGED]()}})},Ih=function(){!Ne||k(this,Vr)||(lt(this,Vr,!0),Hm(k(this,ee).castOptions),k(this,ee).textTracks.addEventListener("change",k(this,ds)),It(this,pe,Sh).call(this),lt(this,Je,new Ne.RemotePlayer),new Ne.RemotePlayerController(k(this,Je)),lt(this,Ft,{[Ne.RemotePlayerEventType.IS_CONNECTED_CHANGED]:({value:i})=>{i===!0?(lt(this,Pa,"connected"),this.dispatchEvent(new Event("connect"))):(It(this,pe,Pf).call(this),lt(this,Pa,"disconnected"),this.dispatchEvent(new Event("disconnect")))},[Ne.RemotePlayerEventType.DURATION_CHANGED]:()=>{k(this,ee).dispatchEvent(new Event("durationchange"))},[Ne.RemotePlayerEventType.VOLUME_LEVEL_CHANGED]:()=>{k(this,ee).dispatchEvent(new Event("volumechange"))},[Ne.RemotePlayerEventType.IS_MUTED_CHANGED]:()=>{k(this,ee).dispatchEvent(new Event("volumechange"))},[Ne.RemotePlayerEventType.CURRENT_TIME_CHANGED]:()=>{var i;(i=k(this,pe,Ha))!=null&&i.isMediaLoaded&&k(this,ee).dispatchEvent(new Event("timeupdate"))},[Ne.RemotePlayerEventType.VIDEO_INFO_CHANGED]:()=>{k(this,ee).dispatchEvent(new Event("resize"))},[Ne.RemotePlayerEventType.IS_PAUSED_CHANGED]:()=>{k(this,ee).dispatchEvent(new Event(this.paused?"pause":"play"))},[Ne.RemotePlayerEventType.PLAYER_STATE_CHANGED]:()=>{var i,a;((i=k(this,pe,Ha))==null?void 0:i.playerState)!==chrome.cast.media.PlayerState.PAUSED&&k(this,ee).dispatchEvent(new Event({[chrome.cast.media.PlayerState.PLAYING]:"playing",[chrome.cast.media.PlayerState.BUFFERING]:"waiting",[chrome.cast.media.PlayerState.IDLE]:"emptied"}[(a=k(this,pe,Ha))==null?void 0:a.playerState]))},[Ne.RemotePlayerEventType.IS_MEDIA_LOADED_CHANGED]:()=>W(this,null,function*(){var i;(i=k(this,pe,Ha))!=null&&i.isMediaLoaded&&(yield Promise.resolve(),It(this,pe,Hf).call(this))})}))},Hf=function(){It(this,pe,Rh).call(this)},Rh=function(){return W(this,null,function*(){var d,u,m,_,y;if(!k(this,pe,Ha))return;const a=((u=(d=k(this,Je).mediaInfo)==null?void 0:d.tracks)!=null?u:[]).filter(({type:g})=>g===chrome.cast.media.TrackType.TEXT),r=[...k(this,ee).textTracks].filter(({kind:g})=>g==="subtitles"||g==="captions"),n=a.map(({language:g,name:A,trackId:E})=>{var L;const{mode:T}=(L=r.find(I=>I.language===g&&I.label===A))!=null?L:{};return T?{mode:T,trackId:E}:!1}).filter(Boolean),o=n.filter(({mode:g})=>g!=="showing").map(({trackId:g})=>g),l=n.find(({mode:g})=>g==="showing"),c=(y=(_=(m=Vd())==null?void 0:m.getSessionObj().media[0])==null?void 0:_.activeTrackIds)!=null?y:[];let p=c;if(c.length&&(p=p.filter(g=>!o.includes(g))),l!=null&&l.trackId&&(p=[...p,l.trackId]),p=[...new Set(p)],!((g,A)=>g.length===A.length&&g.every(E=>A.includes(E)))(c,p))try{const g=new chrome.cast.media.EditTracksInfoRequest(p);yield H0(g)}catch(g){console.error(g)}})};const Y0=e=>{var t,i,a,r,n,s,o,ie,Wf;return i=class extends e{constructor(){super(...arguments);Ze(this,o);Ze(this,a,{paused:!1});Ze(this,r,Wm());Ze(this,n);Ze(this,s)}get remote(){return k(this,s)?k(this,s):U0()?this.isConnected?(this.disableRemotePlayback||B0(),Hi.set(this,{loadOnPrompt:()=>It(this,o,Wf).call(this)}),lt(this,s,new q0(this))):void 0:super.remote}disconnectedCallback(){var d,u;(d=k(this,s))==null||d.destroy(),lt(this,s,null),Hi.delete(this),(u=super.disconnectedCallback)==null||u.call(this)}attributeChangedCallback(d,u,m){if(super.attributeChangedCallback(d,u,m),d==="cast-receiver"&&m){k(this,r).receiverApplicationId=m;return}if(k(this,o,ie))switch(d){case"cast-stream-type":case"cast-src":this.load();break}}load(){return W(this,null,function*(){var A,E;if(!k(this,o,ie))return Gr(i.prototype,this,"load").call(this);const d=new chrome.cast.media.MediaInfo(this.castSrc,this.castContentType);d.customData=this.castCustomData;const u=[...this.querySelectorAll("track")].filter(({kind:T,src:L})=>L&&(T==="subtitles"||T==="captions")),m=[];let _=0;if(u.length&&(d.tracks=u.map(T=>{const L=++_;m.length===0&&T.track.mode==="showing"&&m.push(L);const I=new chrome.cast.media.Track(L,chrome.cast.media.TrackType.TEXT);return I.trackContentId=T.src,I.trackContentType="text/vtt",I.subtype=T.kind==="captions"?chrome.cast.media.TextTrackType.CAPTIONS:chrome.cast.media.TextTrackType.SUBTITLES,I.name=T.label,I.language=T.srclang,I})),this.castStreamType==="live"?d.streamType=chrome.cast.media.StreamType.LIVE:d.streamType=chrome.cast.media.StreamType.BUFFERED,d.metadata=new chrome.cast.media.GenericMediaMetadata,d.metadata.title=this.title,d.metadata.images=[{url:this.poster}],yield $0(this.castSrc)){d.contentType||(d.contentType="application/x-mpegURL");const{videoFormat:T,audioFormat:L}=yield V0(this.castSrc);(T==null?void 0:T.includes("m4s"))||(T==null?void 0:T.includes("mp4"))||(T==null?void 0:T.includes("m4a"))?(d.hlsSegmentFormat=chrome.cast.media.HlsSegmentFormat.FMP4,d.hlsVideoSegmentFormat=chrome.cast.media.HlsVideoSegmentFormat.FMP4):L!=null&&L.includes("aac")?(d.hlsSegmentFormat=chrome.cast.media.HlsSegmentFormat.AAC,d.hlsVideoSegmentFormat=chrome.cast.media.HlsVideoSegmentFormat.MPEG2_TS):(T!=null&&T.includes("ts")||L!=null&&L.includes("ts"))&&(d.hlsSegmentFormat=chrome.cast.media.HlsSegmentFormat.TS,d.hlsVideoSegmentFormat=chrome.cast.media.HlsVideoSegmentFormat.MPEG2_TS)}const g=new chrome.cast.media.LoadRequest(d);g.currentTime=(A=Gr(i.prototype,this,"currentTime"))!=null?A:0,g.autoplay=!k(this,a).paused,g.activeTrackIds=m,yield(E=Vd())==null?void 0:E.loadMedia(g),this.dispatchEvent(new Event("volumechange"))})}play(){var d;if(k(this,o,ie)){k(this,o,ie).isPaused&&((d=k(this,o,ie).controller)==null||d.playOrPause());return}return super.play()}pause(){var d;if(k(this,o,ie)){k(this,o,ie).isPaused||(d=k(this,o,ie).controller)==null||d.playOrPause();return}super.pause()}get castOptions(){return k(this,r)}get castReceiver(){var d;return(d=this.getAttribute("cast-receiver"))!=null?d:void 0}set castReceiver(d){this.castReceiver!=d&&this.setAttribute("cast-receiver",`${d}`)}get castSrc(){var m,_,y,g,A;const d=this.currentSrc,u=d!=null&&d.startsWith("blob:")?void 0:d;return(A=(g=(y=(_=this.getAttribute("cast-src"))!=null?_:(m=this.querySelector("source"))==null?void 0:m.src)!=null?y:u)!=null?g:this.getAttribute("src"))!=null?A:void 0}set castSrc(d){this.castSrc!=d&&this.setAttribute("cast-src",`${d}`)}get castContentType(){var d;return(d=this.getAttribute("cast-content-type"))!=null?d:void 0}set castContentType(d){this.setAttribute("cast-content-type",`${d}`)}get castStreamType(){var d,u;return(u=(d=this.getAttribute("cast-stream-type"))!=null?d:this.streamType)!=null?u:void 0}set castStreamType(d){this.setAttribute("cast-stream-type",`${d}`)}get castCustomData(){return k(this,n)}set castCustomData(d){const u=typeof d;if(!["object","undefined"].includes(u)){console.error(`castCustomData must be nullish or an object but value was of type ${u}`);return}lt(this,n,d)}get readyState(){if(k(this,o,ie))switch(k(this,o,ie).playerState){case chrome.cast.media.PlayerState.IDLE:return 0;case chrome.cast.media.PlayerState.BUFFERING:return 2;default:return 3}return super.readyState}get paused(){return k(this,o,ie)?k(this,o,ie).isPaused:super.paused}get muted(){var d;return k(this,o,ie)?(d=k(this,o,ie))==null?void 0:d.isMuted:super.muted}set muted(d){var u;if(k(this,o,ie)){(d&&!k(this,o,ie).isMuted||!d&&k(this,o,ie).isMuted)&&((u=k(this,o,ie).controller)==null||u.muteOrUnmute());return}super.muted=d}get volume(){var d,u;return k(this,o,ie)?(u=(d=k(this,o,ie))==null?void 0:d.volumeLevel)!=null?u:1:super.volume}set volume(d){var u;if(k(this,o,ie)){k(this,o,ie).volumeLevel=+d,(u=k(this,o,ie).controller)==null||u.setVolumeLevel();return}super.volume=d}get duration(){var d,u,m;return k(this,o,ie)&&((d=k(this,o,ie))!=null&&d.isMediaLoaded)?(m=(u=k(this,o,ie))==null?void 0:u.duration)!=null?m:NaN:super.duration}get currentTime(){var d,u,m;return k(this,o,ie)&&((d=k(this,o,ie))!=null&&d.isMediaLoaded)?(m=(u=k(this,o,ie))==null?void 0:u.currentTime)!=null?m:0:super.currentTime}set currentTime(d){var u;if(k(this,o,ie)){k(this,o,ie).currentTime=d,(u=k(this,o,ie).controller)==null||u.seek();return}super.currentTime=d}},a=new WeakMap,r=new WeakMap,n=new WeakMap,s=new WeakMap,o=new WeakSet,ie=function(){var d,u;return(u=(d=Hi.get(k(this,s)))==null?void 0:d.getCastPlayer)==null?void 0:u.call(d)},Wf=function(){return W(this,null,function*(){k(this,a).paused=Gr(i.prototype,this,"paused"),Gr(i.prototype,this,"pause").call(this),this.muted=Gr(i.prototype,this,"muted");try{yield this.load()}catch(d){console.error(d)}})},Nf(i,"observedAttributes",[...(t=e.observedAttributes)!=null?t:[],"cast-src","cast-content-type","cast-stream-type","cast-receiver"]),i},Dw=null;var G0=$(36115),Vm=e=>{throw TypeError(e)},qm=(e,t,i)=>t.has(e)||Vm("Cannot "+i),Ym=(e,t,i)=>(qm(e,t,"read from private field"),i?i.call(e):t.get(e)),Gm=(e,t,i)=>t.has(e)?Vm("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,i),zm=(e,t,i,a)=>(qm(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),Ws=class{addEventListener(){}removeEventListener(){}dispatchEvent(e){return!0}};if(typeof DocumentFragment=="undefined"){class e extends Ws{}globalThis.DocumentFragment=e}var Yd=class extends Ws{},z0=class extends Ws{},Q0={get(e){},define(e,t,i){},getName(e){return null},upgrade(e){},whenDefined(e){return Promise.resolve(Yd)}},Fs,Z0=class{constructor(e,t={}){Gm(this,Fs),zm(this,Fs,t==null?void 0:t.detail)}get detail(){return Ym(this,Fs)}initCustomEvent(){}};Fs=new WeakMap;function j0(e,t){return new Yd}var Qm={document:{createElement:j0},DocumentFragment,customElements:Q0,CustomEvent:Z0,EventTarget:Ws,HTMLElement:Yd,HTMLVideoElement:z0},Zm=typeof window=="undefined"||typeof globalThis.customElements=="undefined",Gd=Zm?Qm:globalThis,xw=Zm?Qm.document:globalThis.document,Ks,jm=class extends Y0((0,G0.u6)(D0)){constructor(){super(...arguments),Gm(this,Ks)}get autoplay(){let e=this.getAttribute("autoplay");return e===null?!1:e===""?!0:e}set autoplay(e){let t=this.autoplay;e!==t&&(e?this.setAttribute("autoplay",typeof e=="string"?e:""):this.removeAttribute("autoplay"))}get muxCastCustomData(){return{mux:{playbackId:this.playbackId,minResolution:this.minResolution,maxResolution:this.maxResolution,renditionOrder:this.renditionOrder,customDomain:this.customDomain,tokens:{drm:this.drmToken},envKey:this.envKey,metadata:this.metadata,disableCookies:this.disableCookies,disableTracking:this.disableTracking,beaconCollectionDomain:this.beaconCollectionDomain,startTime:this.startTime,preferCmcd:this.preferCmcd}}}get castCustomData(){var e;return(e=Ym(this,Ks))!=null?e:this.muxCastCustomData}set castCustomData(e){zm(this,Ks,e)}};Ks=new WeakMap,Gd.customElements.get("mux-video")||(Gd.customElements.define("mux-video",jm),Gd.MuxVideoElement=jm);var Ow=null;const x={MEDIA_PLAY_REQUEST:"mediaplayrequest",MEDIA_PAUSE_REQUEST:"mediapauserequest",MEDIA_MUTE_REQUEST:"mediamuterequest",MEDIA_UNMUTE_REQUEST:"mediaunmuterequest",MEDIA_LOOP_REQUEST:"medialooprequest",MEDIA_VOLUME_REQUEST:"mediavolumerequest",MEDIA_SEEK_REQUEST:"mediaseekrequest",MEDIA_AIRPLAY_REQUEST:"mediaairplayrequest",MEDIA_ENTER_FULLSCREEN_REQUEST:"mediaenterfullscreenrequest",MEDIA_EXIT_FULLSCREEN_REQUEST:"mediaexitfullscreenrequest",MEDIA_PREVIEW_REQUEST:"mediapreviewrequest",MEDIA_ENTER_PIP_REQUEST:"mediaenterpiprequest",MEDIA_EXIT_PIP_REQUEST:"mediaexitpiprequest",MEDIA_ENTER_CAST_REQUEST:"mediaentercastrequest",MEDIA_EXIT_CAST_REQUEST:"mediaexitcastrequest",MEDIA_SHOW_TEXT_TRACKS_REQUEST:"mediashowtexttracksrequest",MEDIA_HIDE_TEXT_TRACKS_REQUEST:"mediahidetexttracksrequest",MEDIA_SHOW_SUBTITLES_REQUEST:"mediashowsubtitlesrequest",MEDIA_DISABLE_SUBTITLES_REQUEST:"mediadisablesubtitlesrequest",MEDIA_TOGGLE_SUBTITLES_REQUEST:"mediatogglesubtitlesrequest",MEDIA_PLAYBACK_RATE_REQUEST:"mediaplaybackraterequest",MEDIA_RENDITION_REQUEST:"mediarenditionrequest",MEDIA_AUDIO_TRACK_REQUEST:"mediaaudiotrackrequest",MEDIA_SEEK_TO_LIVE_REQUEST:"mediaseektoliverequest",REGISTER_MEDIA_STATE_RECEIVER:"registermediastatereceiver",UNREGISTER_MEDIA_STATE_RECEIVER:"unregistermediastatereceiver"},ae={MEDIA_CHROME_ATTRIBUTES:"mediachromeattributes",MEDIA_CONTROLLER:"mediacontroller"},Xm={MEDIA_AIRPLAY_UNAVAILABLE:"mediaAirplayUnavailable",MEDIA_AUDIO_TRACK_ENABLED:"mediaAudioTrackEnabled",MEDIA_AUDIO_TRACK_LIST:"mediaAudioTrackList",MEDIA_AUDIO_TRACK_UNAVAILABLE:"mediaAudioTrackUnavailable",MEDIA_BUFFERED:"mediaBuffered",MEDIA_CAST_UNAVAILABLE:"mediaCastUnavailable",MEDIA_CHAPTERS_CUES:"mediaChaptersCues",MEDIA_CURRENT_TIME:"mediaCurrentTime",MEDIA_DURATION:"mediaDuration",MEDIA_ENDED:"mediaEnded",MEDIA_ERROR:"mediaError",MEDIA_ERROR_CODE:"mediaErrorCode",MEDIA_ERROR_MESSAGE:"mediaErrorMessage",MEDIA_FULLSCREEN_UNAVAILABLE:"mediaFullscreenUnavailable",MEDIA_HAS_PLAYED:"mediaHasPlayed",MEDIA_HEIGHT:"mediaHeight",MEDIA_IS_AIRPLAYING:"mediaIsAirplaying",MEDIA_IS_CASTING:"mediaIsCasting",MEDIA_IS_FULLSCREEN:"mediaIsFullscreen",MEDIA_IS_PIP:"mediaIsPip",MEDIA_LOADING:"mediaLoading",MEDIA_MUTED:"mediaMuted",MEDIA_LOOP:"mediaLoop",MEDIA_PAUSED:"mediaPaused",MEDIA_PIP_UNAVAILABLE:"mediaPipUnavailable",MEDIA_PLAYBACK_RATE:"mediaPlaybackRate",MEDIA_PREVIEW_CHAPTER:"mediaPreviewChapter",MEDIA_PREVIEW_COORDS:"mediaPreviewCoords",MEDIA_PREVIEW_IMAGE:"mediaPreviewImage",MEDIA_PREVIEW_TIME:"mediaPreviewTime",MEDIA_RENDITION_LIST:"mediaRenditionList",MEDIA_RENDITION_SELECTED:"mediaRenditionSelected",MEDIA_RENDITION_UNAVAILABLE:"mediaRenditionUnavailable",MEDIA_SEEKABLE:"mediaSeekable",MEDIA_STREAM_TYPE:"mediaStreamType",MEDIA_SUBTITLES_LIST:"mediaSubtitlesList",MEDIA_SUBTITLES_SHOWING:"mediaSubtitlesShowing",MEDIA_TARGET_LIVE_WINDOW:"mediaTargetLiveWindow",MEDIA_TIME_IS_LIVE:"mediaTimeIsLive",MEDIA_VOLUME:"mediaVolume",MEDIA_VOLUME_LEVEL:"mediaVolumeLevel",MEDIA_VOLUME_UNAVAILABLE:"mediaVolumeUnavailable",MEDIA_LANG:"mediaLang",MEDIA_WIDTH:"mediaWidth"},Jm=Object.entries(Xm),h=Jm.reduce((e,[t,i])=>(e[t]=i.toLowerCase(),e),{}),X0={USER_INACTIVE_CHANGE:"userinactivechange",BREAKPOINTS_CHANGE:"breakpointchange",BREAKPOINTS_COMPUTED:"breakpointscomputed"},zt=Jm.reduce((e,[t,i])=>(e[t]=i.toLowerCase(),e),U({},X0)),Nw=Object.entries(zt).reduce((e,[t,i])=>{const a=h[t];return a&&(e[i]=a),e},{userinactivechange:"userinactive"}),J0=Object.entries(h).reduce((e,[t,i])=>{const a=zt[t];return a&&(e[i]=a),e},{userinactive:"userinactivechange"}),Qt={SUBTITLES:"subtitles",CAPTIONS:"captions",DESCRIPTIONS:"descriptions",CHAPTERS:"chapters",METADATA:"metadata"},$a={DISABLED:"disabled",HIDDEN:"hidden",SHOWING:"showing"},Pw=null,zd={MOUSE:"mouse",PEN:"pen",TOUCH:"touch"},dt={UNAVAILABLE:"unavailable",UNSUPPORTED:"unsupported"},Ai={LIVE:"live",ON_DEMAND:"on-demand",UNKNOWN:"unknown"},Uw=null,ey={INLINE:"inline",FULLSCREEN:"fullscreen",PICTURE_IN_PICTURE:"picture-in-picture"};function ty(e){return e==null?void 0:e.map(ay).join(" ")}function iy(e){return e==null?void 0:e.split(/\s+/).map(ry)}function ay(e){if(e){const{id:t,width:i,height:a}=e;return[t,i,a].filter(r=>r!=null).join(":")}}function ry(e){if(e){const[t,i,a]=e.split(":");return{id:t,width:+i,height:+a}}}function ny(e){return e==null?void 0:e.map(oy).join(" ")}function sy(e){return e==null?void 0:e.split(/\s+/).map(ly)}function oy(e){if(e){const{id:t,kind:i,language:a,label:r}=e;return[t,i,a,r].filter(n=>n!=null).join(":")}}function ly(e){if(e){const[t,i,a,r]=e.split(":");return{id:t,kind:i,language:a,label:r}}}function Bw(e){return e.split("-").map(function(t,i){return(i?t[0].toUpperCase():t[0].toLowerCase())+t.slice(1).toLowerCase()}).join("")}function Hw(e,t=!1){return e.split("_").map(function(i,a){return(a||t?i[0].toUpperCase():i[0].toLowerCase())+i.slice(1).toLowerCase()}).join("")}function dy(e){return e.replace(/[-_]([a-z])/g,(t,i)=>i.toUpperCase())}function Qd(e){return typeof e=="number"&&!Number.isNaN(e)&&Number.isFinite(e)}function ep(e){return typeof e!="string"?!1:!isNaN(e)&&!isNaN(parseFloat(e))}const tp=e=>new Promise(t=>setTimeout(t,e)),Ww=e=>e&&e[0].toUpperCase()+e.slice(1),uy={"Start airplay":"Start airplay","Stop airplay":"Stop airplay",Audio:"Audio",Captions:"Captions","Enable captions":"Enable captions","Disable captions":"Disable captions","Start casting":"Start casting","Stop casting":"Stop casting","Enter fullscreen mode":"Enter fullscreen mode","Exit fullscreen mode":"Exit fullscreen mode",Mute:"Mute",Unmute:"Unmute",Loop:"Loop","Enter picture in picture mode":"Enter picture in picture mode","Exit picture in picture mode":"Exit picture in picture mode",Play:"Play",Pause:"Pause","Playback rate":"Playback rate","Playback rate {playbackRate}":"Playback rate {playbackRate}",Quality:"Quality","Seek backward":"Seek backward","Seek forward":"Seek forward",Settings:"Settings",Auto:"Auto","audio player":"audio player","video player":"video player",volume:"volume",seek:"seek","closed captions":"closed captions","current playback rate":"current playback rate","playback time":"playback time","media loading":"media loading",settings:"settings","audio tracks":"audio tracks",quality:"quality",play:"play",pause:"pause",mute:"mute",unmute:"unmute","chapter: {chapterName}":"chapter: {chapterName}",live:"live",Off:"Off","start airplay":"start airplay","stop airplay":"stop airplay","start casting":"start casting","stop casting":"stop casting","enter fullscreen mode":"enter fullscreen mode","exit fullscreen mode":"exit fullscreen mode","enter picture in picture mode":"enter picture in picture mode","exit picture in picture mode":"exit picture in picture mode","seek to live":"seek to live","playing live":"playing live","seek back {seekOffset} seconds":"seek back {seekOffset} seconds","seek forward {seekOffset} seconds":"seek forward {seekOffset} seconds","Network Error":"Network Error","Decode Error":"Decode Error","Source Not Supported":"Source Not Supported","Encryption Error":"Encryption Error","A network error caused the media download to fail.":"A network error caused the media download to fail.","A media error caused playback to be aborted. The media could be corrupt or your browser does not support this format.":"A media error caused playback to be aborted. The media could be corrupt or your browser does not support this format.","An unsupported error occurred. The server or network failed, or your browser does not support this format.":"An unsupported error occurred. The server or network failed, or your browser does not support this format.","The media is encrypted and there are no keys to decrypt it.":"The media is encrypted and there are no keys to decrypt it.",hour:"hour",hours:"hours",minute:"minute",minutes:"minutes",second:"second",seconds:"seconds","{time} remaining":"{time} remaining","{currentTime} of {totalTime}":"{currentTime} of {totalTime}","video not loaded, unknown time.":"video not loaded, unknown time."};var ip;const Va={en:uy};let qa=((ip=globalThis.navigator)==null?void 0:ip.language)||"en";const cy=e=>{qa=e},Fw=(e,t)=>{Va[e]=t},hy=e=>{var t,i,a;const[r]=qa.split("-");return((t=Va[qa])==null?void 0:t[e])||((i=Va[r])==null?void 0:i[e])||((a=Va.en)==null?void 0:a[e])||e},my=()=>{const[e]=qa.split("-");return Va[qa]?qa:Va[e]?e:"en"},D=(e,t={})=>hy(e).replace(/\{(\w+)\}/g,(i,a)=>a in t?String(t[a]):`{${a}}`),ap=[{singular:"hour",plural:"hours"},{singular:"minute",plural:"minutes"},{singular:"second",plural:"seconds"}],py=(e,t)=>{const i=D(e===1?ap[t].singular:ap[t].plural);return`${e} ${i}`},cn=e=>{if(!Qd(e))return"";const t=Math.abs(e),i=t!==e,a=new Date(0,0,0,0,0,t,0),n=[a.getHours(),a.getMinutes(),a.getSeconds()].map((s,o)=>s&&py(s,o)).filter(s=>s).join(", ");return i?D("{time} remaining",{time:n}):n};function Fi(e,t){let i=!1;e<0&&(i=!0,e=0-e),e=e<0?0:e;let a=Math.floor(e%60),r=Math.floor(e/60%60),n=Math.floor(e/3600);const s=Math.floor(t/60%60),o=Math.floor(t/3600);return(isNaN(e)||e===1/0)&&(n=r=a="0"),n=n>0||o>0?n+":":"",r=((n||s>=10)&&r<10?"0"+r:r)+":",a=a<10?"0"+a:a,(i?"-":"")+n+r+a}const vy=Object.freeze({length:0,start(e){const t=e>>>0;if(t>=this.length)throw new DOMException(`Failed to execute 'start' on 'TimeRanges': The index provided (${t}) is greater than or equal to the maximum bound (${this.length}).`);return 0},end(e){const t=e>>>0;if(t>=this.length)throw new DOMException(`Failed to execute 'end' on 'TimeRanges': The index provided (${t}) is greater than or equal to the maximum bound (${this.length}).`);return 0}});function Kw(e=vy){return Array.from(e).map((t,i)=>[Number(e.start(i).toFixed(3)),Number(e.end(i).toFixed(3))].join(":")).join(" ")}class rp{addEventListener(){}removeEventListener(){}dispatchEvent(){return!0}}class np extends rp{}class sp extends np{constructor(){super(...arguments),this.role=null}}class _y{observe(){}unobserve(){}disconnect(){}}const op={createElement:function(){return new hn.HTMLElement},createElementNS:function(){return new hn.HTMLElement},addEventListener(){},removeEventListener(){},dispatchEvent(e){return!1}},hn={ResizeObserver:_y,document:op,Node:np,Element:sp,HTMLElement:class extends sp{constructor(){super(...arguments),this.innerHTML=""}get content(){return new hn.DocumentFragment}},DocumentFragment:class extends rp{},customElements:{get:function(){},define:function(){},whenDefined:function(){}},localStorage:{getItem(e){return null},setItem(e,t){},removeItem(e){}},CustomEvent:function(){},getComputedStyle:function(){},navigator:{languages:[],get userAgent(){return""}},matchMedia(e){return{matches:!1,media:e}},DOMParser:class{parseFromString(t,i){return{body:{textContent:t}}}}},lp="global"in globalThis&&(globalThis==null?void 0:globalThis.global)===globalThis||typeof window=="undefined"||typeof window.customElements=="undefined",dp=Object.keys(hn).every(e=>e in globalThis),b=lp&&!dp?hn:globalThis,Le=lp&&!dp?op:globalThis.document,up=new WeakMap,Zd=e=>{let t=up.get(e);return t||up.set(e,t=new Set),t},cp=new b.ResizeObserver(e=>{for(const t of e)for(const i of Zd(t.target))i(t)});function Ya(e,t){Zd(e).add(t),cp.observe(e)}function Ga(e,t){const i=Zd(e);i.delete(t),i.size||cp.unobserve(e)}function ut(e){const t={};for(const i of e)t[i.name]=i.value;return t}function at(e){var t;return(t=jd(e))!=null?t:za(e,"media-controller")}function jd(e){var t;const{MEDIA_CONTROLLER:i}=ae,a=e.getAttribute(i);if(a)return(t=$s(e))==null?void 0:t.getElementById(a)}const hp=(e,t,i=".value")=>{const a=e.querySelector(i);a&&(a.textContent=t)},fy=(e,t)=>{const i=`slot[name="${t}"]`,a=e.shadowRoot.querySelector(i);return a?a.children:[]},mp=(e,t)=>fy(e,t)[0],ki=(e,t)=>!e||!t?!1:e!=null&&e.contains(t)?!0:ki(e,t.getRootNode().host),za=(e,t)=>{if(!e)return null;const i=e.closest(t);return i||za(e.getRootNode().host,t)};function Xd(e=document){var t;const i=e==null?void 0:e.activeElement;return i?(t=Xd(i.shadowRoot))!=null?t:i:null}function $s(e){var t;const i=(t=e==null?void 0:e.getRootNode)==null?void 0:t.call(e);return i instanceof ShadowRoot||i instanceof Document?i:null}function pp(e,{depth:t=3,checkOpacity:i=!0,checkVisibilityCSS:a=!0}={}){if(e.checkVisibility)return e.checkVisibility({checkOpacity:i,checkVisibilityCSS:a});let r=e;for(;r&&t>0;){const n=getComputedStyle(r);if(i&&n.opacity==="0"||a&&n.visibility==="hidden"||n.display==="none")return!1;r=r.parentElement,t--}return!0}function Ey(e,t,i,a){const r=a.x-i.x,n=a.y-i.y,s=r*r+n*n;if(s===0)return 0;const o=((e-i.x)*r+(t-i.y)*n)/s;return Math.max(0,Math.min(1,o))}function $w(e,t){return Math.sqrt(Math.pow(t.x-e.x,2)+Math.pow(t.y-e.y,2))}function Pe(e,t){const i=by(e,a=>a===t);return i||Jd(e,t)}function by(e,t){var i,a;let r;for(r of(i=e.querySelectorAll("style:not([media])"))!=null?i:[]){let n;try{n=(a=r.sheet)==null?void 0:a.cssRules}catch(s){continue}for(const s of n!=null?n:[])if(t(s.selectorText))return s}}function Jd(e,t){var i,a;const r=(i=e.querySelectorAll("style:not([media])"))!=null?i:[],n=r==null?void 0:r[r.length-1];if(!(n!=null&&n.sheet))return console.warn("Media Chrome: No style sheet found on style tag of",e),{style:{setProperty:()=>{},removeProperty:()=>"",getPropertyValue:()=>""}};const s=n==null?void 0:n.sheet.insertRule(`${t}{}`,n.sheet.cssRules.length);return(a=n.sheet.cssRules)==null?void 0:a[s]}function ce(e,t,i=Number.NaN){const a=e.getAttribute(t);return a!=null?+a:i}function ge(e,t,i){const a=+i;if(i==null||Number.isNaN(a)){e.hasAttribute(t)&&e.removeAttribute(t);return}ce(e,t,void 0)!==a&&e.setAttribute(t,`${a}`)}function j(e,t){return e.hasAttribute(t)}function X(e,t,i){if(i==null){e.hasAttribute(t)&&e.removeAttribute(t);return}j(e,t)!=i&&e.toggleAttribute(t,i)}function _e(e,t,i=null){var a;return(a=e.getAttribute(t))!=null?a:i}function me(e,t,i){if(i==null){e.hasAttribute(t)&&e.removeAttribute(t);return}const a=`${i}`;_e(e,t,void 0)!==a&&e.setAttribute(t,a)}var vp=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},Dt=(e,t,i)=>(vp(e,t,"read from private field"),i?i.call(e):t.get(e)),gy=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},Vs=(e,t,i,a)=>(vp(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),Ve;function yy(e){return`
    <style>
      :host {
        display: var(--media-control-display, var(--media-gesture-receiver-display, inline-block));
        box-sizing: border-box;
      }
    </style>
  `}class qs extends b.HTMLElement{constructor(){if(super(),gy(this,Ve,void 0),!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);const t=ut(this.attributes);this.shadowRoot.innerHTML=this.constructor.getTemplateHTML(t)}}static get observedAttributes(){return[ae.MEDIA_CONTROLLER,h.MEDIA_PAUSED]}attributeChangedCallback(t,i,a){var r,n,s,o,l;t===ae.MEDIA_CONTROLLER&&(i&&((n=(r=Dt(this,Ve))==null?void 0:r.unassociateElement)==null||n.call(r,this),Vs(this,Ve,null)),a&&this.isConnected&&(Vs(this,Ve,(s=this.getRootNode())==null?void 0:s.getElementById(a)),(l=(o=Dt(this,Ve))==null?void 0:o.associateElement)==null||l.call(o,this)))}connectedCallback(){var t,i;this.tabIndex=-1,this.setAttribute("aria-hidden","true"),Vs(this,Ve,Ty(this)),this.getAttribute(ae.MEDIA_CONTROLLER)&&((i=(t=Dt(this,Ve))==null?void 0:t.associateElement)==null||i.call(t,this)),Dt(this,Ve)&&(Dt(this,Ve).addEventListener("pointerdown",this),Dt(this,Ve).addEventListener("click",this),Dt(this,Ve).hasAttribute("tabindex")||(Dt(this,Ve).tabIndex=0))}disconnectedCallback(){var t,i,a,r;this.getAttribute(ae.MEDIA_CONTROLLER)&&((i=(t=Dt(this,Ve))==null?void 0:t.unassociateElement)==null||i.call(t,this)),(a=Dt(this,Ve))==null||a.removeEventListener("pointerdown",this),(r=Dt(this,Ve))==null||r.removeEventListener("click",this),Vs(this,Ve,null)}handleEvent(t){var i;const a=(i=t.composedPath())==null?void 0:i[0];if(["video","media-controller"].includes(a==null?void 0:a.localName)){if(t.type==="pointerdown")this._pointerType=t.pointerType;else if(t.type==="click"){const{clientX:n,clientY:s}=t,{left:o,top:l,width:c,height:p}=this.getBoundingClientRect(),v=n-o,d=s-l;if(v<0||d<0||v>c||d>p||c===0&&p===0)return;const u=this._pointerType||"mouse";if(this._pointerType=void 0,u===zd.TOUCH){this.handleTap(t);return}else if(u===zd.MOUSE||u===zd.PEN){this.handleMouseClick(t);return}}}}get mediaPaused(){return j(this,h.MEDIA_PAUSED)}set mediaPaused(t){X(this,h.MEDIA_PAUSED,t)}handleTap(t){}handleMouseClick(t){const i=this.mediaPaused?x.MEDIA_PLAY_REQUEST:x.MEDIA_PAUSE_REQUEST;this.dispatchEvent(new b.CustomEvent(i,{composed:!0,bubbles:!0}))}}Ve=new WeakMap,qs.shadowRootOptions={mode:"open"},qs.getTemplateHTML=yy;function Ty(e){var t;const i=e.getAttribute(ae.MEDIA_CONTROLLER);return i?(t=e.getRootNode())==null?void 0:t.getElementById(i):za(e,"media-controller")}b.customElements.get("media-gesture-receiver")||b.customElements.define("media-gesture-receiver",qs);var _p=qs,eu=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},we=(e,t,i)=>(eu(e,t,"read from private field"),i?i.call(e):t.get(e)),je=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},xt=(e,t,i,a)=>(eu(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),Ot=(e,t,i)=>(eu(e,t,"access private method"),i),mn,Ys,Qa,Za,ja,tu,Xa,Gs,iu,fp,au,Ep,pn,zs,Qs,ru,Ja,vn,Ki,Zs;const B={AUDIO:"audio",AUTOHIDE:"autohide",BREAKPOINTS:"breakpoints",GESTURES_DISABLED:"gesturesdisabled",KEYBOARD_CONTROL:"keyboardcontrol",NO_AUTOHIDE:"noautohide",USER_INACTIVE:"userinactive",AUTOHIDE_OVER_CONTROLS:"autohideovercontrols"};function Ay(e){return`
    <style>
      
      :host([${h.MEDIA_IS_FULLSCREEN}]) ::slotted([slot=media]) {
        outline: none;
      }

      :host {
        box-sizing: border-box;
        position: relative;
        display: inline-block;
        line-height: 0;
        background-color: var(--media-background-color, #000);
        overflow: hidden;
      }

      :host(:not([${B.AUDIO}])) [part~=layer]:not([part~=media-layer]) {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        display: flex;
        flex-flow: column nowrap;
        align-items: start;
        pointer-events: none;
        background: none;
      }

      slot[name=media] {
        display: var(--media-slot-display, contents);
      }

      
      :host([${B.AUDIO}]) slot[name=media] {
        display: var(--media-slot-display, none);
      }

      
      :host([${B.AUDIO}]) [part~=layer][part~=gesture-layer] {
        height: 0;
        display: block;
      }

      
      :host(:not([${B.AUDIO}])[${B.GESTURES_DISABLED}]) ::slotted([slot=gestures-chrome]),
          :host(:not([${B.AUDIO}])[${B.GESTURES_DISABLED}]) media-gesture-receiver[slot=gestures-chrome] {
        display: none;
      }

      
      ::slotted(:not([slot=media]):not([slot=poster]):not(media-loading-indicator):not([role=dialog]):not([hidden])) {
        pointer-events: auto;
      }

      :host(:not([${B.AUDIO}])) *[part~=layer][part~=centered-layer] {
        align-items: center;
        justify-content: center;
      }

      :host(:not([${B.AUDIO}])) ::slotted(media-gesture-receiver[slot=gestures-chrome]),
      :host(:not([${B.AUDIO}])) media-gesture-receiver[slot=gestures-chrome] {
        align-self: stretch;
        flex-grow: 1;
      }

      slot[name=middle-chrome] {
        display: inline;
        flex-grow: 1;
        pointer-events: none;
        background: none;
      }

      
      ::slotted([slot=media]),
      ::slotted([slot=poster]) {
        width: 100%;
        height: 100%;
      }

      
      :host(:not([${B.AUDIO}])) .spacer {
        flex-grow: 1;
      }

      
      :host(:-webkit-full-screen) {
        
        width: 100% !important;
        height: 100% !important;
      }

      
      ::slotted(:not([slot=media]):not([slot=poster]):not([${B.NO_AUTOHIDE}]):not([hidden]):not([role=dialog])) {
        opacity: 1;
        transition: var(--media-control-transition-in, opacity 0.25s);
      }

      
      :host([${B.USER_INACTIVE}]:not([${h.MEDIA_PAUSED}]):not([${h.MEDIA_IS_AIRPLAYING}]):not([${h.MEDIA_IS_CASTING}]):not([${B.AUDIO}])) ::slotted(:not([slot=media]):not([slot=poster]):not([${B.NO_AUTOHIDE}]):not([role=dialog])) {
        opacity: 0;
        transition: var(--media-control-transition-out, opacity 1s);
      }

      :host([${B.USER_INACTIVE}]:not([${B.NO_AUTOHIDE}]):not([${h.MEDIA_PAUSED}]):not([${h.MEDIA_IS_CASTING}]):not([${B.AUDIO}])) ::slotted([slot=media]) {
        cursor: none;
      }

      :host([${B.USER_INACTIVE}][${B.AUTOHIDE_OVER_CONTROLS}]:not([${B.NO_AUTOHIDE}]):not([${h.MEDIA_PAUSED}]):not([${h.MEDIA_IS_CASTING}]):not([${B.AUDIO}])) * {
        --media-cursor: none;
        cursor: none;
      }


      ::slotted(media-control-bar)  {
        align-self: stretch;
      }

      
      :host(:not([${B.AUDIO}])[${h.MEDIA_HAS_PLAYED}]) slot[name=poster] {
        display: none;
      }

      ::slotted([role=dialog]) {
        width: 100%;
        height: 100%;
        align-self: center;
      }

      ::slotted([role=menu]) {
        align-self: end;
      }
    </style>

    <slot name="media" part="layer media-layer"></slot>
    <slot name="poster" part="layer poster-layer"></slot>
    <slot name="gestures-chrome" part="layer gesture-layer">
      <media-gesture-receiver slot="gestures-chrome">
        <template shadowrootmode="${_p.shadowRootOptions.mode}">
          ${_p.getTemplateHTML({})}
        </template>
      </media-gesture-receiver>
    </slot>
    <span part="layer vertical-layer">
      <slot name="top-chrome" part="top chrome"></slot>
      <slot name="middle-chrome" part="middle chrome"></slot>
      <slot name="centered-chrome" part="layer centered-layer center centered chrome"></slot>
      
      <slot part="bottom chrome"></slot>
    </span>
    <slot name="dialog" part="layer dialog-layer"></slot>
  `}const ky=Object.values(h),wy="sm:384 md:576 lg:768 xl:960";function Sy(e){bp(e.target,e.contentRect.width)}function bp(e,t){var i;if(!e.isConnected)return;const a=(i=e.getAttribute(B.BREAKPOINTS))!=null?i:wy,r=Iy(a),n=Ry(r,t);let s=!1;if(Object.keys(r).forEach(o=>{if(n.includes(o)){e.hasAttribute(`breakpoint${o}`)||(e.setAttribute(`breakpoint${o}`,""),s=!0);return}e.hasAttribute(`breakpoint${o}`)&&(e.removeAttribute(`breakpoint${o}`),s=!0)}),s){const o=new CustomEvent(zt.BREAKPOINTS_CHANGE,{detail:n});e.dispatchEvent(o)}e.breakpointsComputed||(e.breakpointsComputed=!0,e.dispatchEvent(new CustomEvent(zt.BREAKPOINTS_COMPUTED,{bubbles:!0,composed:!0})))}function Iy(e){const t=e.split(/\s+/);return Object.fromEntries(t.map(i=>i.split(":")))}function Ry(e,t){return Object.keys(e).filter(i=>t>=parseInt(e[i]))}class js extends b.HTMLElement{constructor(){if(super(),je(this,iu),je(this,au),je(this,pn),je(this,Qs),je(this,Ja),je(this,mn,void 0),je(this,Ys,0),je(this,Qa,null),je(this,Za,null),je(this,ja,void 0),this.breakpointsComputed=!1,je(this,tu,t=>{const i=this.media;for(const a of t){if(a.type!=="childList")continue;const r=a.removedNodes;for(const n of r){if(n.slot!="media"||a.target!=this)continue;let s=a.previousSibling&&a.previousSibling.previousElementSibling;if(!s||!i)this.mediaUnsetCallback(n);else{let o=s.slot!=="media";for(;(s=s.previousSibling)!==null;)s.slot=="media"&&(o=!1);o&&this.mediaUnsetCallback(n)}}if(i)for(const n of a.addedNodes)n===i&&this.handleMediaUpdated(i)}}),je(this,Xa,!1),je(this,Gs,t=>{we(this,Xa)||(setTimeout(()=>{Sy(t),xt(this,Xa,!1)},0),xt(this,Xa,!0))}),je(this,Ki,void 0),je(this,Zs,()=>{if(!we(this,Ki).assignedElements({flatten:!0}).length){we(this,Qa)&&this.mediaUnsetCallback(we(this,Qa));return}this.handleMediaUpdated(this.media)}),!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);const t=ut(this.attributes),i=this.constructor.getTemplateHTML(t);this.shadowRoot.setHTMLUnsafe?this.shadowRoot.setHTMLUnsafe(i):this.shadowRoot.innerHTML=i}xt(this,mn,new MutationObserver(we(this,tu)))}static get observedAttributes(){return[B.AUTOHIDE,B.GESTURES_DISABLED].concat(ky).filter(t=>![h.MEDIA_RENDITION_LIST,h.MEDIA_AUDIO_TRACK_LIST,h.MEDIA_CHAPTERS_CUES,h.MEDIA_WIDTH,h.MEDIA_HEIGHT,h.MEDIA_ERROR,h.MEDIA_ERROR_MESSAGE].includes(t))}attributeChangedCallback(t,i,a){t.toLowerCase()==B.AUTOHIDE&&(this.autohide=a)}get media(){let t=this.querySelector(":scope > [slot=media]");return(t==null?void 0:t.nodeName)=="SLOT"&&(t=t.assignedElements({flatten:!0})[0]),t}handleMediaUpdated(t){return W(this,null,function*(){t&&(xt(this,Qa,t),t.localName.includes("-")&&(yield b.customElements.whenDefined(t.localName)),this.mediaSetCallback(t))})}connectedCallback(){var t;we(this,mn).observe(this,{childList:!0,subtree:!0}),Ya(this,we(this,Gs));const i=this.getAttribute(B.AUDIO)!=null,a=D(i?"audio player":"video player");this.setAttribute("role","region"),this.setAttribute("aria-label",a),this.handleMediaUpdated(this.media),this.setAttribute(B.USER_INACTIVE,""),bp(this,this.getBoundingClientRect().width);const r=this.querySelector(":scope > slot[slot=media]");r&&(xt(this,Ki,r),we(this,Ki).addEventListener("slotchange",we(this,Zs))),this.addEventListener("pointerdown",this),this.addEventListener("pointermove",this),this.addEventListener("pointerup",this),this.addEventListener("mouseleave",this),this.addEventListener("keyup",this),(t=b.window)==null||t.addEventListener("mouseup",this)}disconnectedCallback(){var t;Ga(this,we(this,Gs)),clearTimeout(we(this,Za)),we(this,mn).disconnect(),this.media&&this.mediaUnsetCallback(this.media),(t=b.window)==null||t.removeEventListener("mouseup",this),this.removeEventListener("pointerdown",this),this.removeEventListener("pointermove",this),this.removeEventListener("pointerup",this),this.removeEventListener("mouseleave",this),this.removeEventListener("keyup",this),we(this,Ki)&&(we(this,Ki).removeEventListener("slotchange",we(this,Zs)),xt(this,Ki,null)),xt(this,Xa,!1)}mediaSetCallback(t){}mediaUnsetCallback(t){xt(this,Qa,null)}handleEvent(t){switch(t.type){case"pointerdown":xt(this,Ys,t.timeStamp);break;case"pointermove":Ot(this,iu,fp).call(this,t);break;case"pointerup":Ot(this,au,Ep).call(this,t);break;case"mouseleave":Ot(this,pn,zs).call(this);break;case"mouseup":this.removeAttribute(B.KEYBOARD_CONTROL);break;case"keyup":Ot(this,Ja,vn).call(this),this.setAttribute(B.KEYBOARD_CONTROL,"");break}}set autohide(t){const i=Number(t);xt(this,ja,isNaN(i)?0:i)}get autohide(){return(we(this,ja)===void 0?2:we(this,ja)).toString()}get breakpoints(){return _e(this,B.BREAKPOINTS)}set breakpoints(t){me(this,B.BREAKPOINTS,t)}get audio(){return j(this,B.AUDIO)}set audio(t){X(this,B.AUDIO,t)}get gesturesDisabled(){return j(this,B.GESTURES_DISABLED)}set gesturesDisabled(t){X(this,B.GESTURES_DISABLED,t)}get keyboardControl(){return j(this,B.KEYBOARD_CONTROL)}set keyboardControl(t){X(this,B.KEYBOARD_CONTROL,t)}get noAutohide(){return j(this,B.NO_AUTOHIDE)}set noAutohide(t){X(this,B.NO_AUTOHIDE,t)}get autohideOverControls(){return j(this,B.AUTOHIDE_OVER_CONTROLS)}set autohideOverControls(t){X(this,B.AUTOHIDE_OVER_CONTROLS,t)}get userInteractive(){return j(this,B.USER_INACTIVE)}set userInteractive(t){X(this,B.USER_INACTIVE,t)}}mn=new WeakMap,Ys=new WeakMap,Qa=new WeakMap,Za=new WeakMap,ja=new WeakMap,tu=new WeakMap,Xa=new WeakMap,Gs=new WeakMap,iu=new WeakSet,fp=function(e){if(e.pointerType!=="mouse"&&e.timeStamp-we(this,Ys)<250)return;Ot(this,Qs,ru).call(this),clearTimeout(we(this,Za));const t=this.hasAttribute(B.AUTOHIDE_OVER_CONTROLS);([this,this.media].includes(e.target)||t)&&Ot(this,Ja,vn).call(this)},au=new WeakSet,Ep=function(e){if(e.pointerType==="touch"){const t=!this.hasAttribute(B.USER_INACTIVE);[this,this.media].includes(e.target)&&t?Ot(this,pn,zs).call(this):Ot(this,Ja,vn).call(this)}else e.composedPath().some(t=>["media-play-button","media-fullscreen-button"].includes(t==null?void 0:t.localName))&&Ot(this,Ja,vn).call(this)},pn=new WeakSet,zs=function(){if(we(this,ja)<0||this.hasAttribute(B.USER_INACTIVE))return;this.setAttribute(B.USER_INACTIVE,"");const e=new b.CustomEvent(zt.USER_INACTIVE_CHANGE,{composed:!0,bubbles:!0,detail:!0});this.dispatchEvent(e)},Qs=new WeakSet,ru=function(){if(!this.hasAttribute(B.USER_INACTIVE))return;this.removeAttribute(B.USER_INACTIVE);const e=new b.CustomEvent(zt.USER_INACTIVE_CHANGE,{composed:!0,bubbles:!0,detail:!1});this.dispatchEvent(e)},Ja=new WeakSet,vn=function(){Ot(this,Qs,ru).call(this),clearTimeout(we(this,Za));const e=parseInt(this.autohide);e<0||xt(this,Za,setTimeout(()=>{Ot(this,pn,zs).call(this)},e*1e3))},Ki=new WeakMap,Zs=new WeakMap,js.shadowRootOptions={mode:"open"},js.getTemplateHTML=Ay,b.customElements.get("media-container")||b.customElements.define("media-container",js);var Vw=null,gp=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},We=(e,t,i)=>(gp(e,t,"read from private field"),i?i.call(e):t.get(e)),_n=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},Xs=(e,t,i,a)=>(gp(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),er,tr,Js,fa,wi,$i;class nu{constructor(t,i,{defaultValue:a}={defaultValue:void 0}){_n(this,wi),_n(this,er,void 0),_n(this,tr,void 0),_n(this,Js,void 0),_n(this,fa,new Set),Xs(this,er,t),Xs(this,tr,i),Xs(this,Js,new Set(a))}[Symbol.iterator](){return We(this,wi,$i).values()}get length(){return We(this,wi,$i).size}get value(){var t;return(t=[...We(this,wi,$i)].join(" "))!=null?t:""}set value(t){var i;t!==this.value&&(Xs(this,fa,new Set),this.add(...(i=t==null?void 0:t.split(" "))!=null?i:[]))}toString(){return this.value}item(t){return[...We(this,wi,$i)][t]}values(){return We(this,wi,$i).values()}forEach(t,i){We(this,wi,$i).forEach(t,i)}add(...t){var i,a;t.forEach(r=>We(this,fa).add(r)),!(this.value===""&&!((i=We(this,er))!=null&&i.hasAttribute(`${We(this,tr)}`)))&&((a=We(this,er))==null||a.setAttribute(`${We(this,tr)}`,`${this.value}`))}remove(...t){var i;t.forEach(a=>We(this,fa).delete(a)),(i=We(this,er))==null||i.setAttribute(`${We(this,tr)}`,`${this.value}`)}contains(t){return We(this,wi,$i).has(t)}toggle(t,i){return typeof i!="undefined"?i?(this.add(t),!0):(this.remove(t),!1):this.contains(t)?(this.remove(t),!1):(this.add(t),!0)}replace(t,i){return this.remove(t),this.add(i),t===i}}er=new WeakMap,tr=new WeakMap,Js=new WeakMap,fa=new WeakMap,wi=new WeakSet,$i=function(){return We(this,fa).size?We(this,fa):We(this,Js)};const Ly=(e="")=>e.split(/\s+/),yp=(e="")=>{const[t,i,a]=e.split(":"),r=a?decodeURIComponent(a):void 0;return{kind:t==="cc"?Qt.CAPTIONS:Qt.SUBTITLES,language:i,label:r}},eo=(e="",t={})=>Ly(e).map(i=>{const a=yp(i);return U(U({},t),a)}),Tp=e=>e?Array.isArray(e)?e.map(t=>typeof t=="string"?yp(t):t):typeof e=="string"?eo(e):[e]:[],su=({kind:e,label:t,language:i}={kind:"subtitles"})=>t?`${e==="captions"?"cc":"sb"}:${i}:${encodeURIComponent(t)}`:i,fn=(e=[])=>Array.prototype.map.call(e,su).join(" "),Cy=(e,t)=>i=>i[e]===t,Ap=e=>{const t=Object.entries(e).map(([i,a])=>Cy(i,a));return i=>t.every(a=>a(i))},En=(e,t=[],i=[])=>{const a=Tp(i).map(Ap),r=n=>a.some(s=>s(n));Array.from(t).filter(r).forEach(n=>{n.mode=e})},to=(e,t=()=>!0)=>{if(!(e!=null&&e.textTracks))return[];const i=typeof t=="function"?t:Ap(t);return Array.from(e.textTracks).filter(i)},kp=e=>{var t;return!!((t=e.mediaSubtitlesShowing)!=null&&t.length)||e.hasAttribute(h.MEDIA_SUBTITLES_SHOWING)},My=e=>{var t;const{media:i,fullscreenElement:a}=e;try{const r=a&&"requestFullscreen"in a?"requestFullscreen":a&&"webkitRequestFullScreen"in a?"webkitRequestFullScreen":void 0;if(r){const n=(t=a[r])==null?void 0:t.call(a);if(n instanceof Promise)return n.catch(()=>{})}else i!=null&&i.webkitEnterFullscreen?i.webkitEnterFullscreen():i!=null&&i.requestFullscreen&&i.requestFullscreen()}catch(r){console.error(r)}},wp="exitFullscreen"in Le?"exitFullscreen":"webkitExitFullscreen"in Le?"webkitExitFullscreen":"webkitCancelFullScreen"in Le?"webkitCancelFullScreen":void 0,Dy=e=>{var t;const{documentElement:i}=e;if(wp){const a=(t=i==null?void 0:i[wp])==null?void 0:t.call(i);if(a instanceof Promise)return a.catch(()=>{})}},bn="fullscreenElement"in Le?"fullscreenElement":"webkitFullscreenElement"in Le?"webkitFullscreenElement":void 0,xy=e=>{const{documentElement:t,media:i}=e,a=t==null?void 0:t[bn];return!a&&"webkitDisplayingFullscreen"in i&&"webkitPresentationMode"in i&&i.webkitDisplayingFullscreen&&i.webkitPresentationMode===ey.FULLSCREEN?i:a},Oy=e=>{var t;const{media:i,documentElement:a,fullscreenElement:r=i}=e;if(!i||!a)return!1;const n=xy(e);if(!n)return!1;if(n===r||n===i)return!0;if(n.localName.includes("-")){let s=n.shadowRoot;if(!(bn in s))return ki(n,r);for(;s!=null&&s[bn];){if(s[bn]===r)return!0;s=(t=s[bn])==null?void 0:t.shadowRoot}}return!1},Ny="fullscreenEnabled"in Le?"fullscreenEnabled":"webkitFullscreenEnabled"in Le?"webkitFullscreenEnabled":void 0,Py=e=>{const{documentElement:t,media:i}=e;return!!(t!=null&&t[Ny])||i&&"webkitSupportsFullscreen"in i};let io;const ou=()=>{var e,t;return io||(io=(t=(e=Le)==null?void 0:e.createElement)==null?void 0:t.call(e,"video"),io)},Uy=(...t)=>W(null,[...t],function*(e=ou()){if(!e)return!1;const i=e.volume;e.volume=i/2+.1;const a=new AbortController,r=yield Promise.race([By(e,a.signal),Hy(e,i)]);return a.abort(),r}),By=(e,t)=>new Promise(i=>{e.addEventListener("volumechange",()=>i(!0),{signal:t})}),Hy=(e,t)=>W(null,null,function*(){for(let i=0;i<10;i++){if(e.volume===t)return!1;yield tp(10)}return e.volume!==t}),Wy=/.*Version\/.*Safari\/.*/.test(b.navigator.userAgent),Sp=(e=ou())=>b.matchMedia("(display-mode: standalone)").matches&&Wy?!1:typeof(e==null?void 0:e.requestPictureInPicture)=="function",Ip=(e=ou())=>Py({documentElement:Le,media:e}),Fy=Ip(),Ky=Sp(),$y=!!b.WebKitPlaybackTargetAvailabilityEvent,Vy=!!b.chrome,ao=e=>to(e.media,t=>[Qt.SUBTITLES,Qt.CAPTIONS].includes(t.kind)).sort((t,i)=>t.kind>=i.kind?1:-1),Rp=e=>to(e.media,t=>t.mode===$a.SHOWING&&[Qt.SUBTITLES,Qt.CAPTIONS].includes(t.kind)),Lp=(e,t)=>{const i=ao(e),a=Rp(e),r=!!a.length;if(i.length){if(t===!1||r&&t!==!0)En($a.DISABLED,i,a);else if(t===!0||!r&&t!==!1){let n=i[0];const{options:s}=e;if(!(s!=null&&s.noSubtitlesLangPref)){const p=b.localStorage.getItem("media-chrome-pref-subtitles-lang"),v=p?[p,...b.navigator.languages]:b.navigator.languages,d=i.filter(u=>v.some(m=>u.language.toLowerCase().startsWith(m.split("-")[0]))).sort((u,m)=>{const _=v.findIndex(g=>u.language.toLowerCase().startsWith(g.split("-")[0])),y=v.findIndex(g=>m.language.toLowerCase().startsWith(g.split("-")[0]));return _-y});d[0]&&(n=d[0])}const{language:o,label:l,kind:c}=n;En($a.DISABLED,i,a),En($a.SHOWING,i,[{language:o,label:l,kind:c}])}}},lu=(e,t)=>e===t?!0:e==null||t==null||typeof e!=typeof t?!1:typeof e=="number"&&Number.isNaN(e)&&Number.isNaN(t)?!0:typeof e!="object"?!1:Array.isArray(e)?qy(e,t):Object.entries(e).every(([i,a])=>i in t&&lu(a,t[i])),qy=(e,t)=>{const i=Array.isArray(e),a=Array.isArray(t);return i!==a?!1:i||a?e.length!==t.length?!1:e.every((r,n)=>lu(r,t[n])):!0},Yy=Object.values(Ai);let ro;const Gy=Uy().then(e=>(ro=e,ro)),zy=(...e)=>W(null,null,function*(){yield Promise.all(e.filter(t=>t).map(t=>W(null,null,function*(){if(!("localName"in t&&t instanceof b.HTMLElement))return;const i=t.localName;if(!i.includes("-"))return;const a=b.customElements.get(i);a&&t instanceof a||(yield b.customElements.whenDefined(i),b.customElements.upgrade(t))})))}),Qy=new b.DOMParser,Zy=e=>e&&(Qy.parseFromString(e,"text/html").body.textContent||e),gn={mediaError:{get(e,t){const{media:i}=e;if((t==null?void 0:t.type)!=="playing")return i==null?void 0:i.error},mediaEvents:["emptied","error","playing"]},mediaErrorCode:{get(e,t){var i;const{media:a}=e;if((t==null?void 0:t.type)!=="playing")return(i=a==null?void 0:a.error)==null?void 0:i.code},mediaEvents:["emptied","error","playing"]},mediaErrorMessage:{get(e,t){var i,a;const{media:r}=e;if((t==null?void 0:t.type)!=="playing")return(a=(i=r==null?void 0:r.error)==null?void 0:i.message)!=null?a:""},mediaEvents:["emptied","error","playing"]},mediaWidth:{get(e){var t;const{media:i}=e;return(t=i==null?void 0:i.videoWidth)!=null?t:0},mediaEvents:["resize"]},mediaHeight:{get(e){var t;const{media:i}=e;return(t=i==null?void 0:i.videoHeight)!=null?t:0},mediaEvents:["resize"]},mediaPaused:{get(e){var t;const{media:i}=e;return(t=i==null?void 0:i.paused)!=null?t:!0},set(e,t){var i;const{media:a}=t;a&&(e?a.pause():(i=a.play())==null||i.catch(()=>{}))},mediaEvents:["play","playing","pause","emptied"]},mediaHasPlayed:{get(e,t){const{media:i}=e;return i?t?t.type==="playing":!i.paused:!1},mediaEvents:["playing","emptied"]},mediaEnded:{get(e){var t;const{media:i}=e;return(t=i==null?void 0:i.ended)!=null?t:!1},mediaEvents:["seeked","ended","emptied"]},mediaPlaybackRate:{get(e){var t;const{media:i}=e;return(t=i==null?void 0:i.playbackRate)!=null?t:1},set(e,t){const{media:i}=t;i&&Number.isFinite(+e)&&(i.playbackRate=+e)},mediaEvents:["ratechange","loadstart"]},mediaMuted:{get(e){var t;const{media:i}=e;return(t=i==null?void 0:i.muted)!=null?t:!1},set(e,t){const{media:i,options:{noMutedPref:a}={}}=t;if(i){i.muted=e;try{const r=b.localStorage.getItem("media-chrome-pref-muted")!==null,n=i.hasAttribute("muted");if(a){r&&b.localStorage.removeItem("media-chrome-pref-muted");return}if(n&&!r)return;b.localStorage.setItem("media-chrome-pref-muted",e?"true":"false")}catch(r){console.debug("Error setting muted pref",r)}}},mediaEvents:["volumechange"],stateOwnersUpdateHandlers:[(e,t)=>{const{options:{noMutedPref:i}}=t,{media:a}=t;if(!(!a||a.muted||i))try{const r=b.localStorage.getItem("media-chrome-pref-muted")==="true";gn.mediaMuted.set(r,t),e(r)}catch(r){console.debug("Error getting muted pref",r)}}]},mediaLoop:{get(e){const{media:t}=e;return t==null?void 0:t.loop},set(e,t){const{media:i}=t;i&&(i.loop=e)},mediaEvents:["medialooprequest"]},mediaVolume:{get(e){var t;const{media:i}=e;return(t=i==null?void 0:i.volume)!=null?t:1},set(e,t){const{media:i,options:{noVolumePref:a}={}}=t;if(i){try{e==null?b.localStorage.removeItem("media-chrome-pref-volume"):!i.hasAttribute("muted")&&!a&&b.localStorage.setItem("media-chrome-pref-volume",e.toString())}catch(r){console.debug("Error setting volume pref",r)}Number.isFinite(+e)&&(i.volume=+e)}},mediaEvents:["volumechange"],stateOwnersUpdateHandlers:[(e,t)=>{const{options:{noVolumePref:i}}=t;if(!i)try{const{media:a}=t;if(!a)return;const r=b.localStorage.getItem("media-chrome-pref-volume");if(r==null)return;gn.mediaVolume.set(+r,t),e(+r)}catch(a){console.debug("Error getting volume pref",a)}}]},mediaVolumeLevel:{get(e){const{media:t}=e;return typeof(t==null?void 0:t.volume)=="undefined"?"high":t.muted||t.volume===0?"off":t.volume<.5?"low":t.volume<.75?"medium":"high"},mediaEvents:["volumechange"]},mediaCurrentTime:{get(e){var t;const{media:i}=e;return(t=i==null?void 0:i.currentTime)!=null?t:0},set(e,t){const{media:i}=t;!i||!Qd(e)||(i.currentTime=e)},mediaEvents:["timeupdate","loadedmetadata"]},mediaDuration:{get(e){const{media:t,options:{defaultDuration:i}={}}=e;return i&&(!t||!t.duration||Number.isNaN(t.duration)||!Number.isFinite(t.duration))?i:Number.isFinite(t==null?void 0:t.duration)?t.duration:Number.NaN},mediaEvents:["durationchange","loadedmetadata","emptied"]},mediaLoading:{get(e){const{media:t}=e;return(t==null?void 0:t.readyState)<3},mediaEvents:["waiting","playing","emptied"]},mediaSeekable:{get(e){var t;const{media:i}=e;if(!((t=i==null?void 0:i.seekable)!=null&&t.length))return;const a=i.seekable.start(0),r=i.seekable.end(i.seekable.length-1);if(!(!a&&!r))return[Number(a.toFixed(3)),Number(r.toFixed(3))]},mediaEvents:["loadedmetadata","emptied","progress","seekablechange"]},mediaBuffered:{get(e){var t;const{media:i}=e,a=(t=i==null?void 0:i.buffered)!=null?t:[];return Array.from(a).map((r,n)=>[Number(a.start(n).toFixed(3)),Number(a.end(n).toFixed(3))])},mediaEvents:["progress","emptied"]},mediaStreamType:{get(e){const{media:t,options:{defaultStreamType:i}={}}=e,a=[Ai.LIVE,Ai.ON_DEMAND].includes(i)?i:void 0;if(!t)return a;const{streamType:r}=t;if(Yy.includes(r))return r===Ai.UNKNOWN?a:r;const n=t.duration;return n===1/0?Ai.LIVE:Number.isFinite(n)?Ai.ON_DEMAND:a},mediaEvents:["emptied","durationchange","loadedmetadata","streamtypechange"]},mediaTargetLiveWindow:{get(e){const{media:t}=e;if(!t)return Number.NaN;const{targetLiveWindow:i}=t,a=gn.mediaStreamType.get(e);return(i==null||Number.isNaN(i))&&a===Ai.LIVE?0:i},mediaEvents:["emptied","durationchange","loadedmetadata","streamtypechange","targetlivewindowchange"]},mediaTimeIsLive:{get(e){const{media:t,options:{liveEdgeOffset:i=10}={}}=e;if(!t)return!1;if(typeof t.liveEdgeStart=="number")return Number.isNaN(t.liveEdgeStart)?!1:t.currentTime>=t.liveEdgeStart;if(!(gn.mediaStreamType.get(e)===Ai.LIVE))return!1;const r=t.seekable;if(!r)return!0;if(!r.length)return!1;const n=r.end(r.length-1)-i;return t.currentTime>=n},mediaEvents:["playing","timeupdate","progress","waiting","emptied"]},mediaSubtitlesList:{get(e){return ao(e).map(({kind:t,label:i,language:a})=>({kind:t,label:i,language:a}))},mediaEvents:["loadstart"],textTracksEvents:["addtrack","removetrack"]},mediaSubtitlesShowing:{get(e){return Rp(e).map(({kind:t,label:i,language:a})=>({kind:t,label:i,language:a}))},mediaEvents:["loadstart"],textTracksEvents:["addtrack","removetrack","change"],stateOwnersUpdateHandlers:[(e,t)=>{var i,a;const{media:r,options:n}=t;if(!r)return;const s=o=>{var l;!n.defaultSubtitles||o&&![Qt.CAPTIONS,Qt.SUBTITLES].includes((l=o==null?void 0:o.track)==null?void 0:l.kind)||Lp(t,!0)};return r.addEventListener("loadstart",s),(i=r.textTracks)==null||i.addEventListener("addtrack",s),(a=r.textTracks)==null||a.addEventListener("removetrack",s),()=>{var o,l;r.removeEventListener("loadstart",s),(o=r.textTracks)==null||o.removeEventListener("addtrack",s),(l=r.textTracks)==null||l.removeEventListener("removetrack",s)}}]},mediaChaptersCues:{get(e){var t;const{media:i}=e;if(!i)return[];const[a]=to(i,{kind:Qt.CHAPTERS});return Array.from((t=a==null?void 0:a.cues)!=null?t:[]).map(({text:r,startTime:n,endTime:s})=>({text:Zy(r),startTime:n,endTime:s}))},mediaEvents:["loadstart","loadedmetadata"],textTracksEvents:["addtrack","removetrack","change"],stateOwnersUpdateHandlers:[(e,t)=>{var i;const{media:a}=t;if(!a)return;const r=a.querySelector('track[kind="chapters"][default][src]'),n=(i=a.shadowRoot)==null?void 0:i.querySelector(':is(video,audio) > track[kind="chapters"][default][src]');return r==null||r.addEventListener("load",e),n==null||n.addEventListener("load",e),()=>{r==null||r.removeEventListener("load",e),n==null||n.removeEventListener("load",e)}}]},mediaIsPip:{get(e){var t,i;const{media:a,documentElement:r}=e;if(!a||!r||!r.pictureInPictureElement)return!1;if(r.pictureInPictureElement===a)return!0;if(r.pictureInPictureElement instanceof HTMLMediaElement)return(t=a.localName)!=null&&t.includes("-")?ki(a,r.pictureInPictureElement):!1;if(r.pictureInPictureElement.localName.includes("-")){let n=r.pictureInPictureElement.shadowRoot;for(;n!=null&&n.pictureInPictureElement;){if(n.pictureInPictureElement===a)return!0;n=(i=n.pictureInPictureElement)==null?void 0:i.shadowRoot}}return!1},set(e,t){const{media:i}=t;if(i)if(e){if(!Le.pictureInPictureEnabled){console.warn("MediaChrome: Picture-in-picture is not enabled");return}if(!i.requestPictureInPicture){console.warn("MediaChrome: The current media does not support picture-in-picture");return}const a=()=>{console.warn("MediaChrome: The media is not ready for picture-in-picture. It must have a readyState > 0.")};i.requestPictureInPicture().catch(r=>{if(r.code===11){if(!i.src){console.warn("MediaChrome: The media is not ready for picture-in-picture. It must have a src set.");return}if(i.readyState===0&&i.preload==="none"){const n=()=>{i.removeEventListener("loadedmetadata",s),i.preload="none"},s=()=>{i.requestPictureInPicture().catch(a),n()};i.addEventListener("loadedmetadata",s),i.preload="metadata",setTimeout(()=>{i.readyState===0&&a(),n()},1e3)}else throw r}else throw r})}else Le.pictureInPictureElement&&Le.exitPictureInPicture()},mediaEvents:["enterpictureinpicture","leavepictureinpicture"]},mediaRenditionList:{get(e){var t;const{media:i}=e;return[...(t=i==null?void 0:i.videoRenditions)!=null?t:[]].map(a=>U({},a))},mediaEvents:["emptied","loadstart"],videoRenditionsEvents:["addrendition","removerendition"]},mediaRenditionSelected:{get(e){var t,i,a;const{media:r}=e;return(a=(i=r==null?void 0:r.videoRenditions)==null?void 0:i[(t=r.videoRenditions)==null?void 0:t.selectedIndex])==null?void 0:a.id},set(e,t){const{media:i}=t;if(!(i!=null&&i.videoRenditions)){console.warn("MediaController: Rendition selection not supported by this media.");return}const a=e,r=Array.prototype.findIndex.call(i.videoRenditions,n=>n.id==a);i.videoRenditions.selectedIndex!=r&&(i.videoRenditions.selectedIndex=r)},mediaEvents:["emptied"],videoRenditionsEvents:["addrendition","removerendition","change"]},mediaAudioTrackList:{get(e){var t;const{media:i}=e;return[...(t=i==null?void 0:i.audioTracks)!=null?t:[]]},mediaEvents:["emptied","loadstart"],audioTracksEvents:["addtrack","removetrack"]},mediaAudioTrackEnabled:{get(e){var t,i;const{media:a}=e;return(i=[...(t=a==null?void 0:a.audioTracks)!=null?t:[]].find(r=>r.enabled))==null?void 0:i.id},set(e,t){const{media:i}=t;if(!(i!=null&&i.audioTracks)){console.warn("MediaChrome: Audio track selection not supported by this media.");return}const a=e;for(const r of i.audioTracks)r.enabled=a==r.id},mediaEvents:["emptied"],audioTracksEvents:["addtrack","removetrack","change"]},mediaIsFullscreen:{get(e){return Oy(e)},set(e,t,i){var a,r;e?(My(t),i.detail&&!((a=t.media)!=null&&a.inert)&&((r=t.media)==null||r.focus())):Dy(t)},rootEvents:["fullscreenchange","webkitfullscreenchange"],mediaEvents:["webkitbeginfullscreen","webkitendfullscreen","webkitpresentationmodechanged"]},mediaIsCasting:{get(e){var t;const{media:i}=e;return!(i!=null&&i.remote)||((t=i.remote)==null?void 0:t.state)==="disconnected"?!1:i.remote.state==="connected"},set(e,t){var i,a;const{media:r}=t;if(r&&!(e&&((i=r.remote)==null?void 0:i.state)!=="disconnected")&&!(!e&&((a=r.remote)==null?void 0:a.state)!=="connected")){if(typeof r.remote.prompt!="function"){console.warn("MediaChrome: Casting is not supported in this environment");return}r.remote.prompt().catch(()=>{})}},remoteEvents:["connect","connecting","disconnect"]},mediaIsAirplaying:{get(){return!1},set(e,t){const{media:i}=t;if(i){if(!(i.webkitShowPlaybackTargetPicker&&b.WebKitPlaybackTargetAvailabilityEvent)){console.error("MediaChrome: received a request to select AirPlay but AirPlay is not supported in this environment");return}i.webkitShowPlaybackTargetPicker()}},mediaEvents:["webkitcurrentplaybacktargetiswirelesschanged"]},mediaFullscreenUnavailable:{get(e){const{media:t}=e;if(!Fy||!Ip(t))return dt.UNSUPPORTED}},mediaPipUnavailable:{get(e){const{media:t}=e;if(!Ky||!Sp(t))return dt.UNSUPPORTED;if(t!=null&&t.disablePictureInPicture)return dt.UNAVAILABLE}},mediaVolumeUnavailable:{get(e){const{media:t}=e;if(ro===!1||(t==null?void 0:t.volume)==null)return dt.UNSUPPORTED},stateOwnersUpdateHandlers:[e=>{ro==null&&Gy.then(t=>e(t?void 0:dt.UNSUPPORTED))}]},mediaCastUnavailable:{get(e,{availability:t="not-available"}={}){var i;const{media:a}=e;if(!Vy||!((i=a==null?void 0:a.remote)!=null&&i.state))return dt.UNSUPPORTED;if(!(t==null||t==="available"))return dt.UNAVAILABLE},stateOwnersUpdateHandlers:[(e,t)=>{var i;const{media:a}=t;return a?(a.disableRemotePlayback||a.hasAttribute("disableremoteplayback")||(i=a==null?void 0:a.remote)==null||i.watchAvailability(n=>{e({availability:n?"available":"not-available"})}).catch(n=>{n.name==="NotSupportedError"?e({availability:null}):e({availability:"not-available"})}),()=>{var n;(n=a==null?void 0:a.remote)==null||n.cancelWatchAvailability().catch(()=>{})}):void 0}]},mediaAirplayUnavailable:{get(e,t){if(!$y)return dt.UNSUPPORTED;if((t==null?void 0:t.availability)==="not-available")return dt.UNAVAILABLE},mediaEvents:["webkitplaybacktargetavailabilitychanged"],stateOwnersUpdateHandlers:[(e,t)=>{var i;const{media:a}=t;return a?(a.disableRemotePlayback||a.hasAttribute("disableremoteplayback")||(i=a==null?void 0:a.remote)==null||i.watchAvailability(n=>{e({availability:n?"available":"not-available"})}).catch(n=>{n.name==="NotSupportedError"?e({availability:null}):e({availability:"not-available"})}),()=>{var n;(n=a==null?void 0:a.remote)==null||n.cancelWatchAvailability().catch(()=>{})}):void 0}]},mediaRenditionUnavailable:{get(e){var t;const{media:i}=e;if(!(i!=null&&i.videoRenditions))return dt.UNSUPPORTED;if(!((t=i.videoRenditions)!=null&&t.length))return dt.UNAVAILABLE},mediaEvents:["emptied","loadstart"],videoRenditionsEvents:["addrendition","removerendition"]},mediaAudioTrackUnavailable:{get(e){var t,i;const{media:a}=e;if(!(a!=null&&a.audioTracks))return dt.UNSUPPORTED;if(((i=(t=a.audioTracks)==null?void 0:t.length)!=null?i:0)<=1)return dt.UNAVAILABLE},mediaEvents:["emptied","loadstart"],audioTracksEvents:["addtrack","removetrack"]},mediaLang:{get(e){const{options:{mediaLang:t}={}}=e;return t!=null?t:"en"}}},jy={[x.MEDIA_PREVIEW_REQUEST](e,t,{detail:i}){var a,r,n;const{media:s}=t,o=i!=null?i:void 0;let l,c;if(s&&o!=null){const[u]=to(s,{kind:Qt.METADATA,label:"thumbnails"}),m=Array.prototype.find.call((a=u==null?void 0:u.cues)!=null?a:[],(_,y,g)=>y===0?_.endTime>o:y===g.length-1?_.startTime<=o:_.startTime<=o&&_.endTime>o);if(m){const _=/'^(?:[a-z]+:)?\/\//i.test(m.text)||(r=s==null?void 0:s.querySelector('track[label="thumbnails"]'))==null?void 0:r.src,y=new URL(m.text,_);c=new URLSearchParams(y.hash).get("#xywh").split(",").map(A=>+A),l=y.href}}const p=e.mediaDuration.get(t);let d=(n=e.mediaChaptersCues.get(t).find((u,m,_)=>m===_.length-1&&p===u.endTime?u.startTime<=o&&u.endTime>=o:u.startTime<=o&&u.endTime>o))==null?void 0:n.text;return i!=null&&d==null&&(d=""),{mediaPreviewTime:o,mediaPreviewImage:l,mediaPreviewCoords:c,mediaPreviewChapter:d}},[x.MEDIA_PAUSE_REQUEST](e,t){e["mediaPaused"].set(!0,t)},[x.MEDIA_PLAY_REQUEST](e,t){var i,a,r,n;const s="mediaPaused",l=e.mediaStreamType.get(t)===Ai.LIVE,c=!((i=t.options)!=null&&i.noAutoSeekToLive),p=e.mediaTargetLiveWindow.get(t)>0;if(l&&c&&!p){const v=(a=e.mediaSeekable.get(t))==null?void 0:a[1];if(v){const d=(n=(r=t.options)==null?void 0:r.seekToLiveOffset)!=null?n:0,u=v-d;e.mediaCurrentTime.set(u,t)}}e[s].set(!1,t)},[x.MEDIA_PLAYBACK_RATE_REQUEST](e,t,{detail:i}){const a="mediaPlaybackRate",r=i;e[a].set(r,t)},[x.MEDIA_MUTE_REQUEST](e,t){e["mediaMuted"].set(!0,t)},[x.MEDIA_UNMUTE_REQUEST](e,t){const i="mediaMuted";e.mediaVolume.get(t)||e.mediaVolume.set(.25,t),e[i].set(!1,t)},[x.MEDIA_LOOP_REQUEST](e,t,{detail:i}){const a="mediaLoop",r=!!i;return e[a].set(r,t),{mediaLoop:r}},[x.MEDIA_VOLUME_REQUEST](e,t,{detail:i}){const a="mediaVolume",r=i;r&&e.mediaMuted.get(t)&&e.mediaMuted.set(!1,t),e[a].set(r,t)},[x.MEDIA_SEEK_REQUEST](e,t,{detail:i}){const a="mediaCurrentTime",r=i;e[a].set(r,t)},[x.MEDIA_SEEK_TO_LIVE_REQUEST](e,t){var i,a,r;const n="mediaCurrentTime",s=(i=e.mediaSeekable.get(t))==null?void 0:i[1];if(Number.isNaN(Number(s)))return;const o=(r=(a=t.options)==null?void 0:a.seekToLiveOffset)!=null?r:0,l=s-o;e[n].set(l,t)},[x.MEDIA_SHOW_SUBTITLES_REQUEST](e,t,{detail:i}){var a;const{options:r}=t,n=ao(t),s=Tp(i),o=(a=s[0])==null?void 0:a.language;o&&!r.noSubtitlesLangPref&&b.localStorage.setItem("media-chrome-pref-subtitles-lang",o),En($a.SHOWING,n,s)},[x.MEDIA_DISABLE_SUBTITLES_REQUEST](e,t,{detail:i}){const a=ao(t),r=i!=null?i:[];En($a.DISABLED,a,r)},[x.MEDIA_TOGGLE_SUBTITLES_REQUEST](e,t,{detail:i}){Lp(t,i)},[x.MEDIA_RENDITION_REQUEST](e,t,{detail:i}){const a="mediaRenditionSelected",r=i;e[a].set(r,t)},[x.MEDIA_AUDIO_TRACK_REQUEST](e,t,{detail:i}){const a="mediaAudioTrackEnabled",r=i;e[a].set(r,t)},[x.MEDIA_ENTER_PIP_REQUEST](e,t){const i="mediaIsPip";e.mediaIsFullscreen.get(t)&&e.mediaIsFullscreen.set(!1,t),e[i].set(!0,t)},[x.MEDIA_EXIT_PIP_REQUEST](e,t){e["mediaIsPip"].set(!1,t)},[x.MEDIA_ENTER_FULLSCREEN_REQUEST](e,t,i){const a="mediaIsFullscreen";e.mediaIsPip.get(t)&&e.mediaIsPip.set(!1,t),e[a].set(!0,t,i)},[x.MEDIA_EXIT_FULLSCREEN_REQUEST](e,t){e["mediaIsFullscreen"].set(!1,t)},[x.MEDIA_ENTER_CAST_REQUEST](e,t){const i="mediaIsCasting";e.mediaIsFullscreen.get(t)&&e.mediaIsFullscreen.set(!1,t),e[i].set(!0,t)},[x.MEDIA_EXIT_CAST_REQUEST](e,t){e["mediaIsCasting"].set(!1,t)},[x.MEDIA_AIRPLAY_REQUEST](e,t){e["mediaIsAirplaying"].set(!0,t)}},Xy=({media:e,fullscreenElement:t,documentElement:i,stateMediator:a=gn,requestMap:r=jy,options:n={},monitorStateOwnersOnlyWithSubscriptions:s=!0})=>{const o=[],l={options:U({},n)};let c=Object.freeze({mediaPreviewTime:void 0,mediaPreviewImage:void 0,mediaPreviewCoords:void 0,mediaPreviewChapter:void 0});const p=_=>{_!=null&&(lu(_,c)||(c=Object.freeze(U(U({},c),_)),o.forEach(y=>y(c))))},v=()=>{const _=Object.entries(a).reduce((y,[g,{get:A}])=>(y[g]=A(l),y),{});p(_)},d={};let u;const m=(_,y)=>W(null,null,function*(){var g,A,E,T,L,I,S,H,G,ne,z,V,ze,ht,mt,De;const ot=!!u;if(u=U(U(U({},l),u!=null?u:{}),_),ot)return;yield zy(...Object.values(_));const et=o.length>0&&y===0&&s,Kt=l.media!==u.media,$t=((g=l.media)==null?void 0:g.textTracks)!==((A=u.media)==null?void 0:A.textTracks),pt=((E=l.media)==null?void 0:E.videoRenditions)!==((T=u.media)==null?void 0:T.videoRenditions),Be=((L=l.media)==null?void 0:L.audioTracks)!==((I=u.media)==null?void 0:I.audioTracks),Qe=((S=l.media)==null?void 0:S.remote)!==((H=u.media)==null?void 0:H.remote),tt=l.documentElement!==u.documentElement,Pi=!!l.media&&(Kt||et),Ba=!!((G=l.media)!=null&&G.textTracks)&&($t||et),gf=!!((ne=l.media)!=null&&ne.videoRenditions)&&(pt||et),yf=!!((z=l.media)!=null&&z.audioTracks)&&(Be||et),Tf=!!((V=l.media)!=null&&V.remote)&&(Qe||et),Af=!!l.documentElement&&(tt||et),Ah=Pi||Ba||gf||yf||Tf||Af,qr=o.length===0&&y===1&&s,kf=!!u.media&&(Kt||qr),wf=!!((ze=u.media)!=null&&ze.textTracks)&&($t||qr),Sf=!!((ht=u.media)!=null&&ht.videoRenditions)&&(pt||qr),If=!!((mt=u.media)!=null&&mt.audioTracks)&&(Be||qr),Rf=!!((De=u.media)!=null&&De.remote)&&(Qe||qr),Lf=!!u.documentElement&&(tt||qr),Cf=kf||wf||Sf||If||Rf||Lf;if(!(Ah||Cf)){Object.entries(u).forEach(([de,us])=>{l[de]=us}),v(),u=void 0;return}Object.entries(a).forEach(([de,{get:us,mediaEvents:_w=[],textTracksEvents:fw=[],videoRenditionsEvents:Ew=[],audioTracksEvents:bw=[],remoteEvents:gw=[],rootEvents:yw=[],stateOwnersUpdateHandlers:Tw=[]}])=>{d[de]||(d[de]={});const vt=be=>{const xe=us(l,be);p({[de]:xe})};let $e;$e=d[de].mediaEvents,_w.forEach(be=>{$e&&Pi&&(l.media.removeEventListener(be,$e),d[de].mediaEvents=void 0),kf&&(u.media.addEventListener(be,vt),d[de].mediaEvents=vt)}),$e=d[de].textTracksEvents,fw.forEach(be=>{var xe,Vt;$e&&Ba&&((xe=l.media.textTracks)==null||xe.removeEventListener(be,$e),d[de].textTracksEvents=void 0),wf&&((Vt=u.media.textTracks)==null||Vt.addEventListener(be,vt),d[de].textTracksEvents=vt)}),$e=d[de].videoRenditionsEvents,Ew.forEach(be=>{var xe,Vt;$e&&gf&&((xe=l.media.videoRenditions)==null||xe.removeEventListener(be,$e),d[de].videoRenditionsEvents=void 0),Sf&&((Vt=u.media.videoRenditions)==null||Vt.addEventListener(be,vt),d[de].videoRenditionsEvents=vt)}),$e=d[de].audioTracksEvents,bw.forEach(be=>{var xe,Vt;$e&&yf&&((xe=l.media.audioTracks)==null||xe.removeEventListener(be,$e),d[de].audioTracksEvents=void 0),If&&((Vt=u.media.audioTracks)==null||Vt.addEventListener(be,vt),d[de].audioTracksEvents=vt)}),$e=d[de].remoteEvents,gw.forEach(be=>{var xe,Vt;$e&&Tf&&((xe=l.media.remote)==null||xe.removeEventListener(be,$e),d[de].remoteEvents=void 0),Rf&&((Vt=u.media.remote)==null||Vt.addEventListener(be,vt),d[de].remoteEvents=vt)}),$e=d[de].rootEvents,yw.forEach(be=>{$e&&Af&&(l.documentElement.removeEventListener(be,$e),d[de].rootEvents=void 0),Lf&&(u.documentElement.addEventListener(be,vt),d[de].rootEvents=vt)});const id=d[de].stateOwnersUpdateHandlers;if(id&&Ah&&(Array.isArray(id)?id:[id]).forEach(xe=>{typeof xe=="function"&&xe()}),Cf){const be=Tw.map(xe=>xe(vt,u)).filter(xe=>typeof xe=="function");d[de].stateOwnersUpdateHandlers=be.length===1?be[0]:be}else Ah&&(d[de].stateOwnersUpdateHandlers=void 0)}),Object.entries(u).forEach(([de,us])=>{l[de]=us}),v(),u=void 0});return m({media:e,fullscreenElement:t,documentElement:i,options:n}),{dispatch(_){const{type:y,detail:g}=_;if(r[y]&&c.mediaErrorCode==null){p(r[y](a,l,_));return}y==="mediaelementchangerequest"?m({media:g}):y==="fullscreenelementchangerequest"?m({fullscreenElement:g}):y==="documentelementchangerequest"?m({documentElement:g}):y==="optionschangerequest"&&(Object.entries(g!=null?g:{}).forEach(([A,E])=>{l.options[A]=E}),v())},getState(){return c},subscribe(_){return m({},o.length+1),o.push(_),_(c),()=>{const y=o.indexOf(_);y>=0&&(m({},o.length-1),o.splice(y,1))}}}};var qw=null,du=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},P=(e,t,i)=>(du(e,t,"read from private field"),i?i.call(e):t.get(e)),gt=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},Nt=(e,t,i,a)=>(du(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),yn=(e,t,i)=>(du(e,t,"access private method"),i),Si,Tn,J,Zt,An,jt,no,kn,so,uu,Ea,oo,cu,hu,Cp;const Mp=["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Enter"," ","f","m","k","c","l","j",">","<","p"],Dp=10,xp=.025,Op=.25,Jy=.25,e1=2,R={DEFAULT_SUBTITLES:"defaultsubtitles",DEFAULT_STREAM_TYPE:"defaultstreamtype",DEFAULT_DURATION:"defaultduration",FULLSCREEN_ELEMENT:"fullscreenelement",HOTKEYS:"hotkeys",KEYBOARD_BACKWARD_SEEK_OFFSET:"keyboardbackwardseekoffset",KEYBOARD_FORWARD_SEEK_OFFSET:"keyboardforwardseekoffset",KEYBOARD_DOWN_VOLUME_STEP:"keyboarddownvolumestep",KEYBOARD_UP_VOLUME_STEP:"keyboardupvolumestep",KEYS_USED:"keysused",LANG:"lang",LOOP:"loop",LIVE_EDGE_OFFSET:"liveedgeoffset",NO_AUTO_SEEK_TO_LIVE:"noautoseektolive",NO_DEFAULT_STORE:"nodefaultstore",NO_HOTKEYS:"nohotkeys",NO_MUTED_PREF:"nomutedpref",NO_SUBTITLES_LANG_PREF:"nosubtitleslangpref",NO_VOLUME_PREF:"novolumepref",SEEK_TO_LIVE_OFFSET:"seektoliveoffset"};class Np extends js{constructor(){super(),gt(this,so),gt(this,oo),gt(this,hu),this.mediaStateReceivers=[],this.associatedElementSubscriptions=new Map,gt(this,Si,new nu(this,R.HOTKEYS)),gt(this,Tn,void 0),gt(this,J,void 0),gt(this,Zt,null),gt(this,An,void 0),gt(this,jt,void 0),gt(this,no,i=>{var a;(a=P(this,J))==null||a.dispatch(i)}),gt(this,kn,void 0),gt(this,Ea,i=>{const{key:a,shiftKey:r}=i;if(!(r&&(a==="/"||a==="?")||Mp.includes(a))){this.removeEventListener("keyup",P(this,Ea));return}this.keyboardShortcutHandler(i)}),this.associateElement(this);let t={};Nt(this,An,i=>{Object.entries(i).forEach(([a,r])=>{if(a in t&&t[a]===r)return;this.propagateMediaState(a,r);const n=a.toLowerCase(),s=new b.CustomEvent(J0[n],{composed:!0,detail:r});this.dispatchEvent(s)}),t=i})}static get observedAttributes(){return super.observedAttributes.concat(R.NO_HOTKEYS,R.HOTKEYS,R.DEFAULT_STREAM_TYPE,R.DEFAULT_SUBTITLES,R.DEFAULT_DURATION,R.NO_MUTED_PREF,R.NO_VOLUME_PREF,R.LANG,R.LOOP,R.LIVE_EDGE_OFFSET,R.SEEK_TO_LIVE_OFFSET,R.NO_AUTO_SEEK_TO_LIVE)}get mediaStore(){return P(this,J)}set mediaStore(t){var i,a;if(P(this,J)&&((i=P(this,jt))==null||i.call(this),Nt(this,jt,void 0)),Nt(this,J,t),!P(this,J)&&!this.hasAttribute(R.NO_DEFAULT_STORE)){yn(this,so,uu).call(this);return}Nt(this,jt,(a=P(this,J))==null?void 0:a.subscribe(P(this,An)))}get fullscreenElement(){var t;return(t=P(this,Tn))!=null?t:this}set fullscreenElement(t){var i;this.hasAttribute(R.FULLSCREEN_ELEMENT)&&this.removeAttribute(R.FULLSCREEN_ELEMENT),Nt(this,Tn,t),(i=P(this,J))==null||i.dispatch({type:"fullscreenelementchangerequest",detail:this.fullscreenElement})}get defaultSubtitles(){return j(this,R.DEFAULT_SUBTITLES)}set defaultSubtitles(t){X(this,R.DEFAULT_SUBTITLES,t)}get defaultStreamType(){return _e(this,R.DEFAULT_STREAM_TYPE)}set defaultStreamType(t){me(this,R.DEFAULT_STREAM_TYPE,t)}get defaultDuration(){return ce(this,R.DEFAULT_DURATION)}set defaultDuration(t){ge(this,R.DEFAULT_DURATION,t)}get noHotkeys(){return j(this,R.NO_HOTKEYS)}set noHotkeys(t){X(this,R.NO_HOTKEYS,t)}get keysUsed(){return _e(this,R.KEYS_USED)}set keysUsed(t){me(this,R.KEYS_USED,t)}get liveEdgeOffset(){return ce(this,R.LIVE_EDGE_OFFSET)}set liveEdgeOffset(t){ge(this,R.LIVE_EDGE_OFFSET,t)}get noAutoSeekToLive(){return j(this,R.NO_AUTO_SEEK_TO_LIVE)}set noAutoSeekToLive(t){X(this,R.NO_AUTO_SEEK_TO_LIVE,t)}get noVolumePref(){return j(this,R.NO_VOLUME_PREF)}set noVolumePref(t){X(this,R.NO_VOLUME_PREF,t)}get noMutedPref(){return j(this,R.NO_MUTED_PREF)}set noMutedPref(t){X(this,R.NO_MUTED_PREF,t)}get noSubtitlesLangPref(){return j(this,R.NO_SUBTITLES_LANG_PREF)}set noSubtitlesLangPref(t){X(this,R.NO_SUBTITLES_LANG_PREF,t)}get noDefaultStore(){return j(this,R.NO_DEFAULT_STORE)}set noDefaultStore(t){X(this,R.NO_DEFAULT_STORE,t)}get resolvedLang(){return my()}attributeChangedCallback(t,i,a){var r,n,s,o,l,c,p,v,d,u,m,_;if(super.attributeChangedCallback(t,i,a),t===R.NO_HOTKEYS)a!==i&&a===""?(this.hasAttribute(R.HOTKEYS)&&console.warn("Media Chrome: Both `hotkeys` and `nohotkeys` have been set. All hotkeys will be disabled."),this.disableHotkeys()):a!==i&&a===null&&this.enableHotkeys();else if(t===R.HOTKEYS)P(this,Si).value=a;else if(t===R.DEFAULT_SUBTITLES&&a!==i)(r=P(this,J))==null||r.dispatch({type:"optionschangerequest",detail:{defaultSubtitles:this.hasAttribute(R.DEFAULT_SUBTITLES)}});else if(t===R.DEFAULT_STREAM_TYPE)(s=P(this,J))==null||s.dispatch({type:"optionschangerequest",detail:{defaultStreamType:(n=this.getAttribute(R.DEFAULT_STREAM_TYPE))!=null?n:void 0}});else if(t===R.LIVE_EDGE_OFFSET&&a!==i)(o=P(this,J))==null||o.dispatch({type:"optionschangerequest",detail:{liveEdgeOffset:this.hasAttribute(R.LIVE_EDGE_OFFSET)?+this.getAttribute(R.LIVE_EDGE_OFFSET):void 0,seekToLiveOffset:this.hasAttribute(R.SEEK_TO_LIVE_OFFSET)?+this.getAttribute(R.SEEK_TO_LIVE_OFFSET):this.hasAttribute(R.LIVE_EDGE_OFFSET)?+this.getAttribute(R.LIVE_EDGE_OFFSET):void 0}});else if(t===R.SEEK_TO_LIVE_OFFSET&&a!==i)(l=P(this,J))==null||l.dispatch({type:"optionschangerequest",detail:{seekToLiveOffset:this.hasAttribute(R.SEEK_TO_LIVE_OFFSET)?+this.getAttribute(R.SEEK_TO_LIVE_OFFSET):this.hasAttribute(R.LIVE_EDGE_OFFSET)?+this.getAttribute(R.LIVE_EDGE_OFFSET):void 0}});else if(t===R.NO_AUTO_SEEK_TO_LIVE)(c=P(this,J))==null||c.dispatch({type:"optionschangerequest",detail:{noAutoSeekToLive:this.hasAttribute(R.NO_AUTO_SEEK_TO_LIVE)}});else if(t===R.FULLSCREEN_ELEMENT){const y=a?(p=this.getRootNode())==null?void 0:p.getElementById(a):void 0;Nt(this,Tn,y),(v=P(this,J))==null||v.dispatch({type:"fullscreenelementchangerequest",detail:this.fullscreenElement})}else t===R.LANG&&a!==i?(cy(a),(d=P(this,J))==null||d.dispatch({type:"optionschangerequest",detail:{mediaLang:a}})):t===R.LOOP&&a!==i?(u=P(this,J))==null||u.dispatch({type:x.MEDIA_LOOP_REQUEST,detail:a!=null}):t===R.NO_VOLUME_PREF&&a!==i?(m=P(this,J))==null||m.dispatch({type:"optionschangerequest",detail:{noVolumePref:this.hasAttribute(R.NO_VOLUME_PREF)}}):t===R.NO_MUTED_PREF&&a!==i&&((_=P(this,J))==null||_.dispatch({type:"optionschangerequest",detail:{noMutedPref:this.hasAttribute(R.NO_MUTED_PREF)}}))}connectedCallback(){var t,i,a;this.associateElement(this),!P(this,J)&&!this.hasAttribute(R.NO_DEFAULT_STORE)&&yn(this,so,uu).call(this),(t=P(this,J))==null||t.dispatch({type:"documentelementchangerequest",detail:Le}),(i=P(this,J))==null||i.dispatch({type:"fullscreenelementchangerequest",detail:this.fullscreenElement}),super.connectedCallback(),P(this,J)&&!P(this,jt)&&Nt(this,jt,(a=P(this,J))==null?void 0:a.subscribe(P(this,An))),P(this,kn)!==void 0&&P(this,J)&&this.media&&setTimeout(()=>{var r,n,s;(n=(r=this.media)==null?void 0:r.textTracks)!=null&&n.length&&((s=P(this,J))==null||s.dispatch({type:x.MEDIA_TOGGLE_SUBTITLES_REQUEST,detail:P(this,kn)}))},0),this.hasAttribute(R.NO_HOTKEYS)?this.disableHotkeys():this.enableHotkeys()}disconnectedCallback(){var t,i,a,r,n,s;if((t=super.disconnectedCallback)==null||t.call(this),this.disableHotkeys(),P(this,J)){const o=P(this,J).getState();Nt(this,kn,!!((i=o.mediaSubtitlesShowing)!=null&&i.length)),(a=P(this,J))==null||a.dispatch({type:"fullscreenelementchangerequest",detail:void 0}),(r=P(this,J))==null||r.dispatch({type:"documentelementchangerequest",detail:void 0}),(n=P(this,J))==null||n.dispatch({type:x.MEDIA_TOGGLE_SUBTITLES_REQUEST,detail:!1})}P(this,jt)&&((s=P(this,jt))==null||s.call(this),Nt(this,jt,void 0)),this.unassociateElement(this),P(this,Zt)&&(P(this,Zt).remove(),Nt(this,Zt,null))}mediaSetCallback(t){var i;super.mediaSetCallback(t),(i=P(this,J))==null||i.dispatch({type:"mediaelementchangerequest",detail:t}),t.hasAttribute("tabindex")||(t.tabIndex=-1)}mediaUnsetCallback(t){var i;super.mediaUnsetCallback(t),(i=P(this,J))==null||i.dispatch({type:"mediaelementchangerequest",detail:void 0})}propagateMediaState(t,i){Hp(this.mediaStateReceivers,t,i)}associateElement(t){if(!t)return;const{associatedElementSubscriptions:i}=this;if(i.has(t))return;const a=this.registerMediaStateReceiver.bind(this),r=this.unregisterMediaStateReceiver.bind(this),n=s1(t,a,r);Object.values(x).forEach(s=>{t.addEventListener(s,P(this,no))}),i.set(t,n)}unassociateElement(t){if(!t)return;const{associatedElementSubscriptions:i}=this;if(!i.has(t))return;i.get(t)(),i.delete(t),Object.values(x).forEach(r=>{t.removeEventListener(r,P(this,no))})}registerMediaStateReceiver(t){if(!t)return;const i=this.mediaStateReceivers;i.indexOf(t)>-1||(i.push(t),P(this,J)&&Object.entries(P(this,J).getState()).forEach(([r,n])=>{Hp([t],r,n)}))}unregisterMediaStateReceiver(t){const i=this.mediaStateReceivers,a=i.indexOf(t);a<0||i.splice(a,1)}enableHotkeys(){this.addEventListener("keydown",yn(this,oo,cu))}disableHotkeys(){this.removeEventListener("keydown",yn(this,oo,cu)),this.removeEventListener("keyup",P(this,Ea))}get hotkeys(){return P(this,Si)}set hotkeys(t){me(this,R.HOTKEYS,t)}keyboardShortcutHandler(t){var i,a,r,n,s,o,l,c,p;const v=t.target;if(((r=(a=(i=v.getAttribute(R.KEYS_USED))==null?void 0:i.split(" "))!=null?a:v==null?void 0:v.keysUsed)!=null?r:[]).map(g=>g==="Space"?" ":g).filter(Boolean).includes(t.key))return;let u,m,_;if(!(P(this,Si).contains(`no${t.key.toLowerCase()}`)||t.key===" "&&P(this,Si).contains("nospace")||t.shiftKey&&(t.key==="/"||t.key==="?")&&P(this,Si).contains("noshift+/")))switch(t.key){case" ":case"k":u=P(this,J).getState().mediaPaused?x.MEDIA_PLAY_REQUEST:x.MEDIA_PAUSE_REQUEST,this.dispatchEvent(new b.CustomEvent(u,{composed:!0,bubbles:!0}));break;case"m":u=this.mediaStore.getState().mediaVolumeLevel==="off"?x.MEDIA_UNMUTE_REQUEST:x.MEDIA_MUTE_REQUEST,this.dispatchEvent(new b.CustomEvent(u,{composed:!0,bubbles:!0}));break;case"f":u=this.mediaStore.getState().mediaIsFullscreen?x.MEDIA_EXIT_FULLSCREEN_REQUEST:x.MEDIA_ENTER_FULLSCREEN_REQUEST,this.dispatchEvent(new b.CustomEvent(u,{composed:!0,bubbles:!0}));break;case"c":this.dispatchEvent(new b.CustomEvent(x.MEDIA_TOGGLE_SUBTITLES_REQUEST,{composed:!0,bubbles:!0}));break;case"ArrowLeft":case"j":{const g=this.hasAttribute(R.KEYBOARD_BACKWARD_SEEK_OFFSET)?+this.getAttribute(R.KEYBOARD_BACKWARD_SEEK_OFFSET):Dp;m=Math.max(((n=this.mediaStore.getState().mediaCurrentTime)!=null?n:0)-g,0),_=new b.CustomEvent(x.MEDIA_SEEK_REQUEST,{composed:!0,bubbles:!0,detail:m}),this.dispatchEvent(_);break}case"ArrowRight":case"l":{const g=this.hasAttribute(R.KEYBOARD_FORWARD_SEEK_OFFSET)?+this.getAttribute(R.KEYBOARD_FORWARD_SEEK_OFFSET):Dp;m=Math.max(((s=this.mediaStore.getState().mediaCurrentTime)!=null?s:0)+g,0),_=new b.CustomEvent(x.MEDIA_SEEK_REQUEST,{composed:!0,bubbles:!0,detail:m}),this.dispatchEvent(_);break}case"ArrowUp":{const g=this.hasAttribute(R.KEYBOARD_UP_VOLUME_STEP)?+this.getAttribute(R.KEYBOARD_UP_VOLUME_STEP):xp;m=Math.min(((o=this.mediaStore.getState().mediaVolume)!=null?o:1)+g,1),_=new b.CustomEvent(x.MEDIA_VOLUME_REQUEST,{composed:!0,bubbles:!0,detail:m}),this.dispatchEvent(_);break}case"ArrowDown":{const g=this.hasAttribute(R.KEYBOARD_DOWN_VOLUME_STEP)?+this.getAttribute(R.KEYBOARD_DOWN_VOLUME_STEP):xp;m=Math.max(((l=this.mediaStore.getState().mediaVolume)!=null?l:1)-g,0),_=new b.CustomEvent(x.MEDIA_VOLUME_REQUEST,{composed:!0,bubbles:!0,detail:m}),this.dispatchEvent(_);break}case"<":{const g=(c=this.mediaStore.getState().mediaPlaybackRate)!=null?c:1;m=Math.max(g-Op,Jy).toFixed(2),_=new b.CustomEvent(x.MEDIA_PLAYBACK_RATE_REQUEST,{composed:!0,bubbles:!0,detail:m}),this.dispatchEvent(_);break}case">":{const g=(p=this.mediaStore.getState().mediaPlaybackRate)!=null?p:1;m=Math.min(g+Op,e1).toFixed(2),_=new b.CustomEvent(x.MEDIA_PLAYBACK_RATE_REQUEST,{composed:!0,bubbles:!0,detail:m}),this.dispatchEvent(_);break}case"/":case"?":{t.shiftKey&&yn(this,hu,Cp).call(this);break}case"p":{u=this.mediaStore.getState().mediaIsPip?x.MEDIA_EXIT_PIP_REQUEST:x.MEDIA_ENTER_PIP_REQUEST,_=new b.CustomEvent(u,{composed:!0,bubbles:!0}),this.dispatchEvent(_);break}default:break}}}Si=new WeakMap,Tn=new WeakMap,J=new WeakMap,Zt=new WeakMap,An=new WeakMap,jt=new WeakMap,no=new WeakMap,kn=new WeakMap,so=new WeakSet,uu=function(){var e;this.mediaStore=Xy({media:this.media,fullscreenElement:this.fullscreenElement,options:{defaultSubtitles:this.hasAttribute(R.DEFAULT_SUBTITLES),defaultDuration:this.hasAttribute(R.DEFAULT_DURATION)?+this.getAttribute(R.DEFAULT_DURATION):void 0,defaultStreamType:(e=this.getAttribute(R.DEFAULT_STREAM_TYPE))!=null?e:void 0,liveEdgeOffset:this.hasAttribute(R.LIVE_EDGE_OFFSET)?+this.getAttribute(R.LIVE_EDGE_OFFSET):void 0,seekToLiveOffset:this.hasAttribute(R.SEEK_TO_LIVE_OFFSET)?+this.getAttribute(R.SEEK_TO_LIVE_OFFSET):this.hasAttribute(R.LIVE_EDGE_OFFSET)?+this.getAttribute(R.LIVE_EDGE_OFFSET):void 0,noAutoSeekToLive:this.hasAttribute(R.NO_AUTO_SEEK_TO_LIVE),noVolumePref:this.hasAttribute(R.NO_VOLUME_PREF),noMutedPref:this.hasAttribute(R.NO_MUTED_PREF),noSubtitlesLangPref:this.hasAttribute(R.NO_SUBTITLES_LANG_PREF)}})},Ea=new WeakMap,oo=new WeakSet,cu=function(e){var t;const{metaKey:i,altKey:a,key:r,shiftKey:n}=e,s=n&&(r==="/"||r==="?");if(s&&((t=P(this,Zt))!=null&&t.open)){this.removeEventListener("keyup",P(this,Ea));return}if(i||a||!s&&!Mp.includes(r)){this.removeEventListener("keyup",P(this,Ea));return}const o=e.target,l=o instanceof HTMLElement&&(o.tagName.toLowerCase()==="media-volume-range"||o.tagName.toLowerCase()==="media-time-range");[" ","ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(r)&&!(P(this,Si).contains(`no${r.toLowerCase()}`)||r===" "&&P(this,Si).contains("nospace"))&&!l&&e.preventDefault(),this.addEventListener("keyup",P(this,Ea),{once:!0})},hu=new WeakSet,Cp=function(){P(this,Zt)||(Nt(this,Zt,Le.createElement("media-keyboard-shortcuts-dialog")),this.appendChild(P(this,Zt))),P(this,Zt).open=!0};const t1=Object.values(h),i1=Object.values(Xm),Pp=e=>{var t,i,a,r;let{observedAttributes:n}=e.constructor;!n&&((t=e.nodeName)!=null&&t.includes("-"))&&(b.customElements.upgrade(e),{observedAttributes:n}=e.constructor);const s=(r=(a=(i=e==null?void 0:e.getAttribute)==null?void 0:i.call(e,ae.MEDIA_CHROME_ATTRIBUTES))==null?void 0:a.split)==null?void 0:r.call(a,/\s+/);return Array.isArray(n||s)?(n||s).filter(o=>t1.includes(o)):[]},a1=e=>{var t,i;return(t=e.nodeName)!=null&&t.includes("-")&&b.customElements.get((i=e.nodeName)==null?void 0:i.toLowerCase())&&!(e instanceof b.customElements.get(e.nodeName.toLowerCase()))&&b.customElements.upgrade(e),i1.some(a=>a in e)},mu=e=>a1(e)||!!Pp(e).length,Up=e=>{var t;return(t=e==null?void 0:e.join)==null?void 0:t.call(e,":")},Bp={[h.MEDIA_SUBTITLES_LIST]:fn,[h.MEDIA_SUBTITLES_SHOWING]:fn,[h.MEDIA_SEEKABLE]:Up,[h.MEDIA_BUFFERED]:e=>e==null?void 0:e.map(Up).join(" "),[h.MEDIA_PREVIEW_COORDS]:e=>e==null?void 0:e.join(" "),[h.MEDIA_RENDITION_LIST]:ty,[h.MEDIA_AUDIO_TRACK_LIST]:ny},r1=(e,t,i)=>W(null,null,function*(){var a,r;if(e.isConnected||(yield tp(0)),typeof i=="boolean"||i==null)return X(e,t,i);if(typeof i=="number")return ge(e,t,i);if(typeof i=="string")return me(e,t,i);if(Array.isArray(i)&&!i.length)return e.removeAttribute(t);const n=(r=(a=Bp[t])==null?void 0:a.call(Bp,i))!=null?r:i;return e.setAttribute(t,n)}),n1=e=>{var t;return!!((t=e.closest)!=null&&t.call(e,'*[slot="media"]'))},ba=(e,t)=>{if(n1(e))return;const i=(r,n)=>{var s,o;mu(r)&&n(r);const{children:l=[]}=r!=null?r:{},c=(o=(s=r==null?void 0:r.shadowRoot)==null?void 0:s.children)!=null?o:[];[...l,...c].forEach(v=>ba(v,n))},a=e==null?void 0:e.nodeName.toLowerCase();if(a.includes("-")&&!mu(e)){b.customElements.whenDefined(a).then(()=>{i(e,t)});return}i(e,t)},Hp=(e,t,i)=>{e.forEach(a=>{if(t in a){a[t]=i;return}const r=Pp(a),n=t.toLowerCase();r.includes(n)&&r1(a,n,i)})},s1=(e,t,i)=>{ba(e,t);const a=p=>{var v;const d=(v=p==null?void 0:p.composedPath()[0])!=null?v:p.target;t(d)},r=p=>{var v;const d=(v=p==null?void 0:p.composedPath()[0])!=null?v:p.target;i(d)};e.addEventListener(x.REGISTER_MEDIA_STATE_RECEIVER,a),e.addEventListener(x.UNREGISTER_MEDIA_STATE_RECEIVER,r);const n=p=>{p.forEach(v=>{const{addedNodes:d=[],removedNodes:u=[],type:m,target:_,attributeName:y}=v;m==="childList"?(Array.prototype.forEach.call(d,g=>ba(g,t)),Array.prototype.forEach.call(u,g=>ba(g,i))):m==="attributes"&&y===ae.MEDIA_CHROME_ATTRIBUTES&&(mu(_)?t(_):i(_))})};let s=[];const o=p=>{const v=p.target;v.name!=="media"&&(s.forEach(d=>ba(d,i)),s=[...v.assignedElements({flatten:!0})],s.forEach(d=>ba(d,t)))};e.addEventListener("slotchange",o);const l=new MutationObserver(n);return l.observe(e,{childList:!0,attributes:!0,subtree:!0}),()=>{ba(e,i),e.removeEventListener("slotchange",o),l.disconnect(),e.removeEventListener(x.REGISTER_MEDIA_STATE_RECEIVER,a),e.removeEventListener(x.UNREGISTER_MEDIA_STATE_RECEIVER,r)}};b.customElements.get("media-controller")||b.customElements.define("media-controller",Np);var o1=Np;const ir={PLACEMENT:"placement",BOUNDS:"bounds"};function l1(e){return`
    <style>
      :host {
        --_tooltip-background-color: var(--media-tooltip-background-color, var(--media-secondary-color, rgba(20, 20, 30, .7)));
        --_tooltip-background: var(--media-tooltip-background, var(--_tooltip-background-color));
        --_tooltip-arrow-half-width: calc(var(--media-tooltip-arrow-width, 12px) / 2);
        --_tooltip-arrow-height: var(--media-tooltip-arrow-height, 5px);
        --_tooltip-arrow-background: var(--media-tooltip-arrow-color, var(--_tooltip-background-color));
        position: relative;
        pointer-events: none;
        display: var(--media-tooltip-display, inline-flex);
        justify-content: center;
        align-items: center;
        box-sizing: border-box;
        z-index: var(--media-tooltip-z-index, 1);
        background: var(--_tooltip-background);
        color: var(--media-text-color, var(--media-primary-color, rgb(238 238 238)));
        font: var(--media-font,
          var(--media-font-weight, 400)
          var(--media-font-size, 13px) /
          var(--media-text-content-height, var(--media-control-height, 18px))
          var(--media-font-family, helvetica neue, segoe ui, roboto, arial, sans-serif));
        padding: var(--media-tooltip-padding, .35em .7em);
        border: var(--media-tooltip-border, none);
        border-radius: var(--media-tooltip-border-radius, 5px);
        filter: var(--media-tooltip-filter, drop-shadow(0 0 4px rgba(0, 0, 0, .2)));
        white-space: var(--media-tooltip-white-space, nowrap);
      }

      :host([hidden]) {
        display: none;
      }

      img, svg {
        display: inline-block;
      }

      #arrow {
        position: absolute;
        width: 0px;
        height: 0px;
        border-style: solid;
        display: var(--media-tooltip-arrow-display, block);
      }

      :host(:not([placement])),
      :host([placement="top"]) {
        position: absolute;
        bottom: calc(100% + var(--media-tooltip-distance, 12px));
        left: 50%;
        transform: translate(calc(-50% - var(--media-tooltip-offset-x, 0px)), 0);
      }
      :host(:not([placement])) #arrow,
      :host([placement="top"]) #arrow {
        top: 100%;
        left: 50%;
        border-width: var(--_tooltip-arrow-height) var(--_tooltip-arrow-half-width) 0 var(--_tooltip-arrow-half-width);
        border-color: var(--_tooltip-arrow-background) transparent transparent transparent;
        transform: translate(calc(-50% + var(--media-tooltip-offset-x, 0px)), 0);
      }

      :host([placement="right"]) {
        position: absolute;
        left: calc(100% + var(--media-tooltip-distance, 12px));
        top: 50%;
        transform: translate(0, -50%);
      }
      :host([placement="right"]) #arrow {
        top: 50%;
        right: 100%;
        border-width: var(--_tooltip-arrow-half-width) var(--_tooltip-arrow-height) var(--_tooltip-arrow-half-width) 0;
        border-color: transparent var(--_tooltip-arrow-background) transparent transparent;
        transform: translate(0, -50%);
      }

      :host([placement="bottom"]) {
        position: absolute;
        top: calc(100% + var(--media-tooltip-distance, 12px));
        left: 50%;
        transform: translate(calc(-50% - var(--media-tooltip-offset-x, 0px)), 0);
      }
      :host([placement="bottom"]) #arrow {
        bottom: 100%;
        left: 50%;
        border-width: 0 var(--_tooltip-arrow-half-width) var(--_tooltip-arrow-height) var(--_tooltip-arrow-half-width);
        border-color: transparent transparent var(--_tooltip-arrow-background) transparent;
        transform: translate(calc(-50% + var(--media-tooltip-offset-x, 0px)), 0);
      }

      :host([placement="left"]) {
        position: absolute;
        right: calc(100% + var(--media-tooltip-distance, 12px));
        top: 50%;
        transform: translate(0, -50%);
      }
      :host([placement="left"]) #arrow {
        top: 50%;
        left: 100%;
        border-width: var(--_tooltip-arrow-half-width) 0 var(--_tooltip-arrow-half-width) var(--_tooltip-arrow-height);
        border-color: transparent transparent transparent var(--_tooltip-arrow-background);
        transform: translate(0, -50%);
      }
      
      :host([placement="none"]) #arrow {
        display: none;
      }
    </style>
    <slot></slot>
    <div id="arrow"></div>
  `}class lo extends b.HTMLElement{constructor(){if(super(),this.updateXOffset=()=>{var t;if(!pp(this,{checkOpacity:!1,checkVisibilityCSS:!1}))return;const i=this.placement;if(i==="left"||i==="right"){this.style.removeProperty("--media-tooltip-offset-x");return}const a=getComputedStyle(this),r=(t=za(this,"#"+this.bounds))!=null?t:at(this);if(!r)return;const{x:n,width:s}=r.getBoundingClientRect(),{x:o,width:l}=this.getBoundingClientRect(),c=o+l,p=n+s,v=a.getPropertyValue("--media-tooltip-offset-x"),d=v?parseFloat(v.replace("px","")):0,u=a.getPropertyValue("--media-tooltip-container-margin"),m=u?parseFloat(u.replace("px","")):0,_=o-n+d-m,y=c-p+d+m;if(_<0){this.style.setProperty("--media-tooltip-offset-x",`${_}px`);return}if(y>0){this.style.setProperty("--media-tooltip-offset-x",`${y}px`);return}this.style.removeProperty("--media-tooltip-offset-x")},!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);const t=ut(this.attributes);this.shadowRoot.innerHTML=this.constructor.getTemplateHTML(t)}if(this.arrowEl=this.shadowRoot.querySelector("#arrow"),Object.prototype.hasOwnProperty.call(this,"placement")){const t=this.placement;delete this.placement,this.placement=t}}static get observedAttributes(){return[ir.PLACEMENT,ir.BOUNDS]}get placement(){return _e(this,ir.PLACEMENT)}set placement(t){me(this,ir.PLACEMENT,t)}get bounds(){return _e(this,ir.BOUNDS)}set bounds(t){me(this,ir.BOUNDS,t)}}lo.shadowRootOptions={mode:"open"},lo.getTemplateHTML=l1,b.customElements.get("media-tooltip")||b.customElements.define("media-tooltip",lo);var Wp=lo,pu=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},Ce=(e,t,i)=>(pu(e,t,"read from private field"),i?i.call(e):t.get(e)),ar=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},uo=(e,t,i,a)=>(pu(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),d1=(e,t,i)=>(pu(e,t,"access private method"),i),Xt,rr,Vi,nr,co,vu,Fp;const qi={TOOLTIP_PLACEMENT:"tooltipplacement",DISABLED:"disabled",NO_TOOLTIP:"notooltip"};function u1(e,t={}){return`
    <style>
      :host {
        position: relative;
        font: var(--media-font,
          var(--media-font-weight, bold)
          var(--media-font-size, 14px) /
          var(--media-text-content-height, var(--media-control-height, 24px))
          var(--media-font-family, helvetica neue, segoe ui, roboto, arial, sans-serif));
        color: var(--media-text-color, var(--media-primary-color, rgb(238 238 238)));
        background: var(--media-control-background, var(--media-secondary-color, rgb(20 20 30 / .7)));
        padding: var(--media-button-padding, var(--media-control-padding, 10px));
        justify-content: var(--media-button-justify-content, center);
        display: inline-flex;
        align-items: center;
        vertical-align: middle;
        box-sizing: border-box;
        transition: background .15s linear;
        pointer-events: auto;
        cursor: var(--media-cursor, pointer);
        -webkit-tap-highlight-color: transparent;
      }

      
      :host(:focus-visible) {
        box-shadow: var(--media-focus-box-shadow, inset 0 0 0 2px rgb(27 127 204 / .9));
        outline: 0;
      }
      
      :host(:where(:focus)) {
        box-shadow: none;
        outline: 0;
      }

      :host(:hover) {
        background: var(--media-control-hover-background, rgba(50 50 70 / .7));
      }

      slot[name="icon"] {
        display: inline-flex;
        align-items: center;
      }

      svg, img, ::slotted(svg), ::slotted(img) {
        width: var(--media-button-icon-width);
        height: var(--media-button-icon-height, var(--media-control-height, 24px));
        transform: var(--media-button-icon-transform);
        transition: var(--media-button-icon-transition);
        fill: var(--media-icon-color, var(--media-primary-color, rgb(238 238 238)));
        vertical-align: middle;
        max-width: 100%;
        max-height: 100%;
        min-width: 100%;
      }

      media-tooltip {
        
        max-width: 0;
        overflow-x: clip;
        opacity: 0;
        transition: opacity .3s, max-width 0s 9s;
      }

      :host(:hover) media-tooltip,
      :host(:focus-visible) media-tooltip {
        max-width: 100vw;
        opacity: 1;
        transition: opacity .3s;
      }

      :host([notooltip]) slot[name="tooltip"] {
        display: none;
      }
    </style>

    ${this.getSlotTemplateHTML(e,t)}

    <slot name="tooltip">
      <media-tooltip part="tooltip" aria-hidden="true">
        <template shadowrootmode="${Wp.shadowRootOptions.mode}">
          ${Wp.getTemplateHTML({})}
        </template>
        <slot name="tooltip-content">
          ${this.getTooltipContentHTML(e)}
        </slot>
      </media-tooltip>
    </slot>
  `}function c1(e,t){return`
    <slot></slot>
  `}function h1(){return""}class Fe extends b.HTMLElement{constructor(){if(super(),ar(this,vu),ar(this,Xt,void 0),this.preventClick=!1,this.tooltipEl=null,ar(this,rr,t=>{this.preventClick||this.handleClick(t),setTimeout(Ce(this,Vi),0)}),ar(this,Vi,()=>{var t,i;(i=(t=this.tooltipEl)==null?void 0:t.updateXOffset)==null||i.call(t)}),ar(this,nr,t=>{const{key:i}=t;if(!this.keysUsed.includes(i)){this.removeEventListener("keyup",Ce(this,nr));return}this.preventClick||this.handleClick(t)}),ar(this,co,t=>{const{metaKey:i,altKey:a,key:r}=t;if(i||a||!this.keysUsed.includes(r)){this.removeEventListener("keyup",Ce(this,nr));return}this.addEventListener("keyup",Ce(this,nr),{once:!0})}),!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);const t=ut(this.attributes),i=this.constructor.getTemplateHTML(t);this.shadowRoot.setHTMLUnsafe?this.shadowRoot.setHTMLUnsafe(i):this.shadowRoot.innerHTML=i}this.tooltipEl=this.shadowRoot.querySelector("media-tooltip")}static get observedAttributes(){return["disabled",qi.TOOLTIP_PLACEMENT,ae.MEDIA_CONTROLLER,h.MEDIA_LANG]}enable(){this.addEventListener("click",Ce(this,rr)),this.addEventListener("keydown",Ce(this,co)),this.tabIndex=0}disable(){this.removeEventListener("click",Ce(this,rr)),this.removeEventListener("keydown",Ce(this,co)),this.removeEventListener("keyup",Ce(this,nr)),this.tabIndex=-1}attributeChangedCallback(t,i,a){var r,n,s,o,l;t===ae.MEDIA_CONTROLLER?(i&&((n=(r=Ce(this,Xt))==null?void 0:r.unassociateElement)==null||n.call(r,this),uo(this,Xt,null)),a&&this.isConnected&&(uo(this,Xt,(s=this.getRootNode())==null?void 0:s.getElementById(a)),(l=(o=Ce(this,Xt))==null?void 0:o.associateElement)==null||l.call(o,this))):t==="disabled"&&a!==i?a==null?this.enable():this.disable():t===qi.TOOLTIP_PLACEMENT&&this.tooltipEl&&a!==i?this.tooltipEl.placement=a:t===h.MEDIA_LANG&&(this.shadowRoot.querySelector('slot[name="tooltip-content"]').innerHTML=this.constructor.getTooltipContentHTML()),Ce(this,Vi).call(this)}connectedCallback(){var t,i,a;const{style:r}=Pe(this.shadowRoot,":host");r.setProperty("display",`var(--media-control-display, var(--${this.localName}-display, inline-flex))`),this.hasAttribute("disabled")?this.disable():this.enable(),this.setAttribute("role","button");const n=this.getAttribute(ae.MEDIA_CONTROLLER);n&&(uo(this,Xt,(t=this.getRootNode())==null?void 0:t.getElementById(n)),(a=(i=Ce(this,Xt))==null?void 0:i.associateElement)==null||a.call(i,this)),b.customElements.whenDefined("media-tooltip").then(()=>d1(this,vu,Fp).call(this))}disconnectedCallback(){var t,i;this.disable(),(i=(t=Ce(this,Xt))==null?void 0:t.unassociateElement)==null||i.call(t,this),uo(this,Xt,null),this.removeEventListener("mouseenter",Ce(this,Vi)),this.removeEventListener("focus",Ce(this,Vi)),this.removeEventListener("click",Ce(this,rr))}get keysUsed(){return["Enter"," "]}get tooltipPlacement(){return _e(this,qi.TOOLTIP_PLACEMENT)}set tooltipPlacement(t){me(this,qi.TOOLTIP_PLACEMENT,t)}get mediaController(){return _e(this,ae.MEDIA_CONTROLLER)}set mediaController(t){me(this,ae.MEDIA_CONTROLLER,t)}get disabled(){return j(this,qi.DISABLED)}set disabled(t){X(this,qi.DISABLED,t)}get noTooltip(){return j(this,qi.NO_TOOLTIP)}set noTooltip(t){X(this,qi.NO_TOOLTIP,t)}handleClick(t){}}Xt=new WeakMap,rr=new WeakMap,Vi=new WeakMap,nr=new WeakMap,co=new WeakMap,vu=new WeakSet,Fp=function(){this.addEventListener("mouseenter",Ce(this,Vi)),this.addEventListener("focus",Ce(this,Vi)),this.addEventListener("click",Ce(this,rr));const e=this.tooltipPlacement;e&&this.tooltipEl&&(this.tooltipEl.placement=e)},Fe.shadowRootOptions={mode:"open"},Fe.getTemplateHTML=u1,Fe.getSlotTemplateHTML=c1,Fe.getTooltipContentHTML=h1,b.customElements.get("media-chrome-button")||b.customElements.define("media-chrome-button",Fe);var Yw=null;const Kp=`<svg aria-hidden="true" viewBox="0 0 26 24">
  <path d="M22.13 3H3.87a.87.87 0 0 0-.87.87v13.26a.87.87 0 0 0 .87.87h3.4L9 16H5V5h16v11h-4l1.72 2h3.4a.87.87 0 0 0 .87-.87V3.87a.87.87 0 0 0-.86-.87Zm-8.75 11.44a.5.5 0 0 0-.76 0l-4.91 5.73a.5.5 0 0 0 .38.83h9.82a.501.501 0 0 0 .38-.83l-4.91-5.73Z"/>
</svg>
`;function m1(e){return`
    <style>
      :host([${h.MEDIA_IS_AIRPLAYING}]) slot[name=icon] slot:not([name=exit]) {
        display: none !important;
      }

      
      :host(:not([${h.MEDIA_IS_AIRPLAYING}])) slot[name=icon] slot:not([name=enter]) {
        display: none !important;
      }

      :host([${h.MEDIA_IS_AIRPLAYING}]) slot[name=tooltip-enter],
      :host(:not([${h.MEDIA_IS_AIRPLAYING}])) slot[name=tooltip-exit] {
        display: none;
      }
    </style>

    <slot name="icon">
      <slot name="enter">${Kp}</slot>
      <slot name="exit">${Kp}</slot>
    </slot>
  `}function p1(){return`
    <slot name="tooltip-enter">${D("start airplay")}</slot>
    <slot name="tooltip-exit">${D("stop airplay")}</slot>
  `}const $p=e=>{const t=e.mediaIsAirplaying?D("stop airplay"):D("start airplay");e.setAttribute("aria-label",t)};class _u extends Fe{static get observedAttributes(){return[...super.observedAttributes,h.MEDIA_IS_AIRPLAYING,h.MEDIA_AIRPLAY_UNAVAILABLE]}connectedCallback(){super.connectedCallback(),$p(this)}attributeChangedCallback(t,i,a){super.attributeChangedCallback(t,i,a),t===h.MEDIA_IS_AIRPLAYING&&$p(this)}get mediaIsAirplaying(){return j(this,h.MEDIA_IS_AIRPLAYING)}set mediaIsAirplaying(t){X(this,h.MEDIA_IS_AIRPLAYING,t)}get mediaAirplayUnavailable(){return _e(this,h.MEDIA_AIRPLAY_UNAVAILABLE)}set mediaAirplayUnavailable(t){me(this,h.MEDIA_AIRPLAY_UNAVAILABLE,t)}handleClick(){const t=new b.CustomEvent(x.MEDIA_AIRPLAY_REQUEST,{composed:!0,bubbles:!0});this.dispatchEvent(t)}}_u.getSlotTemplateHTML=m1,_u.getTooltipContentHTML=p1,b.customElements.get("media-airplay-button")||b.customElements.define("media-airplay-button",_u);var Gw=null;const v1=`<svg aria-hidden="true" viewBox="0 0 26 24">
  <path d="M22.83 5.68a2.58 2.58 0 0 0-2.3-2.5c-3.62-.24-11.44-.24-15.06 0a2.58 2.58 0 0 0-2.3 2.5c-.23 4.21-.23 8.43 0 12.64a2.58 2.58 0 0 0 2.3 2.5c3.62.24 11.44.24 15.06 0a2.58 2.58 0 0 0 2.3-2.5c.23-4.21.23-8.43 0-12.64Zm-11.39 9.45a3.07 3.07 0 0 1-1.91.57 3.06 3.06 0 0 1-2.34-1 3.75 3.75 0 0 1-.92-2.67 3.92 3.92 0 0 1 .92-2.77 3.18 3.18 0 0 1 2.43-1 2.94 2.94 0 0 1 2.13.78c.364.359.62.813.74 1.31l-1.43.35a1.49 1.49 0 0 0-1.51-1.17 1.61 1.61 0 0 0-1.29.58 2.79 2.79 0 0 0-.5 1.89 3 3 0 0 0 .49 1.93 1.61 1.61 0 0 0 1.27.58 1.48 1.48 0 0 0 1-.37 2.1 2.1 0 0 0 .59-1.14l1.4.44a3.23 3.23 0 0 1-1.07 1.69Zm7.22 0a3.07 3.07 0 0 1-1.91.57 3.06 3.06 0 0 1-2.34-1 3.75 3.75 0 0 1-.92-2.67 3.88 3.88 0 0 1 .93-2.77 3.14 3.14 0 0 1 2.42-1 3 3 0 0 1 2.16.82 2.8 2.8 0 0 1 .73 1.31l-1.43.35a1.49 1.49 0 0 0-1.51-1.21 1.61 1.61 0 0 0-1.29.58A2.79 2.79 0 0 0 15 12a3 3 0 0 0 .49 1.93 1.61 1.61 0 0 0 1.27.58 1.44 1.44 0 0 0 1-.37 2.1 2.1 0 0 0 .6-1.15l1.4.44a3.17 3.17 0 0 1-1.1 1.7Z"/>
</svg>`,_1=`<svg aria-hidden="true" viewBox="0 0 26 24">
  <path d="M17.73 14.09a1.4 1.4 0 0 1-1 .37 1.579 1.579 0 0 1-1.27-.58A3 3 0 0 1 15 12a2.8 2.8 0 0 1 .5-1.85 1.63 1.63 0 0 1 1.29-.57 1.47 1.47 0 0 1 1.51 1.2l1.43-.34A2.89 2.89 0 0 0 19 9.07a3 3 0 0 0-2.14-.78 3.14 3.14 0 0 0-2.42 1 3.91 3.91 0 0 0-.93 2.78 3.74 3.74 0 0 0 .92 2.66 3.07 3.07 0 0 0 2.34 1 3.07 3.07 0 0 0 1.91-.57 3.17 3.17 0 0 0 1.07-1.74l-1.4-.45c-.083.43-.3.822-.62 1.12Zm-7.22 0a1.43 1.43 0 0 1-1 .37 1.58 1.58 0 0 1-1.27-.58A3 3 0 0 1 7.76 12a2.8 2.8 0 0 1 .5-1.85 1.63 1.63 0 0 1 1.29-.57 1.47 1.47 0 0 1 1.51 1.2l1.43-.34a2.81 2.81 0 0 0-.74-1.32 2.94 2.94 0 0 0-2.13-.78 3.18 3.18 0 0 0-2.43 1 4 4 0 0 0-.92 2.78 3.74 3.74 0 0 0 .92 2.66 3.07 3.07 0 0 0 2.34 1 3.07 3.07 0 0 0 1.91-.57 3.23 3.23 0 0 0 1.07-1.74l-1.4-.45a2.06 2.06 0 0 1-.6 1.07Zm12.32-8.41a2.59 2.59 0 0 0-2.3-2.51C18.72 3.05 15.86 3 13 3c-2.86 0-5.72.05-7.53.17a2.59 2.59 0 0 0-2.3 2.51c-.23 4.207-.23 8.423 0 12.63a2.57 2.57 0 0 0 2.3 2.5c1.81.13 4.67.19 7.53.19 2.86 0 5.72-.06 7.53-.19a2.57 2.57 0 0 0 2.3-2.5c.23-4.207.23-8.423 0-12.63Zm-1.49 12.53a1.11 1.11 0 0 1-.91 1.11c-1.67.11-4.45.18-7.43.18-2.98 0-5.76-.07-7.43-.18a1.11 1.11 0 0 1-.91-1.11c-.21-4.14-.21-8.29 0-12.43a1.11 1.11 0 0 1 .91-1.11C7.24 4.56 10 4.49 13 4.49s5.76.07 7.43.18a1.11 1.11 0 0 1 .91 1.11c.21 4.14.21 8.29 0 12.43Z"/>
</svg>`;function f1(e){return`
    <style>
      :host([aria-checked="true"]) slot[name=off] {
        display: none !important;
      }

      
      :host(:not([aria-checked="true"])) slot[name=on] {
        display: none !important;
      }

      :host([aria-checked="true"]) slot[name=tooltip-enable],
      :host(:not([aria-checked="true"])) slot[name=tooltip-disable] {
        display: none;
      }
    </style>

    <slot name="icon">
      <slot name="on">${v1}</slot>
      <slot name="off">${_1}</slot>
    </slot>
  `}function E1(){return`
    <slot name="tooltip-enable">${D("Enable captions")}</slot>
    <slot name="tooltip-disable">${D("Disable captions")}</slot>
  `}const Vp=e=>{e.setAttribute("aria-checked",kp(e).toString())};class fu extends Fe{static get observedAttributes(){return[...super.observedAttributes,h.MEDIA_SUBTITLES_LIST,h.MEDIA_SUBTITLES_SHOWING]}connectedCallback(){super.connectedCallback(),this.setAttribute("role","button"),this.setAttribute("aria-label",D("closed captions")),Vp(this)}attributeChangedCallback(t,i,a){super.attributeChangedCallback(t,i,a),t===h.MEDIA_SUBTITLES_SHOWING&&Vp(this)}get mediaSubtitlesList(){return qp(this,h.MEDIA_SUBTITLES_LIST)}set mediaSubtitlesList(t){Yp(this,h.MEDIA_SUBTITLES_LIST,t)}get mediaSubtitlesShowing(){return qp(this,h.MEDIA_SUBTITLES_SHOWING)}set mediaSubtitlesShowing(t){Yp(this,h.MEDIA_SUBTITLES_SHOWING,t)}handleClick(){this.dispatchEvent(new b.CustomEvent(x.MEDIA_TOGGLE_SUBTITLES_REQUEST,{composed:!0,bubbles:!0}))}}fu.getSlotTemplateHTML=f1,fu.getTooltipContentHTML=E1;const qp=(e,t)=>{const i=e.getAttribute(t);return i?eo(i):[]},Yp=(e,t,i)=>{if(!(i!=null&&i.length)){e.removeAttribute(t);return}const a=fn(i);e.getAttribute(t)!==a&&e.setAttribute(t,a)};b.customElements.get("media-captions-button")||b.customElements.define("media-captions-button",fu);var zw=null;const b1='<svg aria-hidden="true" viewBox="0 0 24 24"><g><path class="cast_caf_icon_arch0" d="M1,18 L1,21 L4,21 C4,19.3 2.66,18 1,18 L1,18 Z"/><path class="cast_caf_icon_arch1" d="M1,14 L1,16 C3.76,16 6,18.2 6,21 L8,21 C8,17.13 4.87,14 1,14 L1,14 Z"/><path class="cast_caf_icon_arch2" d="M1,10 L1,12 C5.97,12 10,16.0 10,21 L12,21 C12,14.92 7.07,10 1,10 L1,10 Z"/><path class="cast_caf_icon_box" d="M21,3 L3,3 C1.9,3 1,3.9 1,5 L1,8 L3,8 L3,5 L21,5 L21,19 L14,19 L14,21 L21,21 C22.1,21 23,20.1 23,19 L23,5 C23,3.9 22.1,3 21,3 L21,3 Z"/></g></svg>',g1='<svg aria-hidden="true" viewBox="0 0 24 24"><g><path class="cast_caf_icon_arch0" d="M1,18 L1,21 L4,21 C4,19.3 2.66,18 1,18 L1,18 Z"/><path class="cast_caf_icon_arch1" d="M1,14 L1,16 C3.76,16 6,18.2 6,21 L8,21 C8,17.13 4.87,14 1,14 L1,14 Z"/><path class="cast_caf_icon_arch2" d="M1,10 L1,12 C5.97,12 10,16.0 10,21 L12,21 C12,14.92 7.07,10 1,10 L1,10 Z"/><path class="cast_caf_icon_box" d="M21,3 L3,3 C1.9,3 1,3.9 1,5 L1,8 L3,8 L3,5 L21,5 L21,19 L14,19 L14,21 L21,21 C22.1,21 23,20.1 23,19 L23,5 C23,3.9 22.1,3 21,3 L21,3 Z"/><path class="cast_caf_icon_boxfill" d="M5,7 L5,8.63 C8,8.6 13.37,14 13.37,17 L19,17 L19,7 Z"/></g></svg>';function y1(e){return`
    <style>
      :host([${h.MEDIA_IS_CASTING}]) slot[name=icon] slot:not([name=exit]) {
        display: none !important;
      }

      
      :host(:not([${h.MEDIA_IS_CASTING}])) slot[name=icon] slot:not([name=enter]) {
        display: none !important;
      }

      :host([${h.MEDIA_IS_CASTING}]) slot[name=tooltip-enter],
      :host(:not([${h.MEDIA_IS_CASTING}])) slot[name=tooltip-exit] {
        display: none;
      }
    </style>

    <slot name="icon">
      <slot name="enter">${b1}</slot>
      <slot name="exit">${g1}</slot>
    </slot>
  `}function T1(){return`
    <slot name="tooltip-enter">${D("Start casting")}</slot>
    <slot name="tooltip-exit">${D("Stop casting")}</slot>
  `}const Gp=e=>{const t=e.mediaIsCasting?D("stop casting"):D("start casting");e.setAttribute("aria-label",t)};class Eu extends Fe{static get observedAttributes(){return[...super.observedAttributes,h.MEDIA_IS_CASTING,h.MEDIA_CAST_UNAVAILABLE]}connectedCallback(){super.connectedCallback(),Gp(this)}attributeChangedCallback(t,i,a){super.attributeChangedCallback(t,i,a),t===h.MEDIA_IS_CASTING&&Gp(this)}get mediaIsCasting(){return j(this,h.MEDIA_IS_CASTING)}set mediaIsCasting(t){X(this,h.MEDIA_IS_CASTING,t)}get mediaCastUnavailable(){return _e(this,h.MEDIA_CAST_UNAVAILABLE)}set mediaCastUnavailable(t){me(this,h.MEDIA_CAST_UNAVAILABLE,t)}handleClick(){const t=this.mediaIsCasting?x.MEDIA_EXIT_CAST_REQUEST:x.MEDIA_ENTER_CAST_REQUEST;this.dispatchEvent(new b.CustomEvent(t,{composed:!0,bubbles:!0}))}}Eu.getSlotTemplateHTML=y1,Eu.getTooltipContentHTML=T1,b.customElements.get("media-cast-button")||b.customElements.define("media-cast-button",Eu);var Qw=null,bu=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},ga=(e,t,i)=>(bu(e,t,"read from private field"),i?i.call(e):t.get(e)),Ii=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},gu=(e,t,i,a)=>(bu(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),ya=(e,t,i)=>(bu(e,t,"access private method"),i),ho,wn,Ta,mo,yu,Tu,zp,Au,Qp,ku,Zp,wu,jp,Su,Xp;function A1(e){return`
    <style>
      :host {
        font: var(--media-font,
          var(--media-font-weight, normal)
          var(--media-font-size, 14px) /
          var(--media-text-content-height, var(--media-control-height, 24px))
          var(--media-font-family, helvetica neue, segoe ui, roboto, arial, sans-serif));
        color: var(--media-text-color, var(--media-primary-color, rgb(238 238 238)));
        display: var(--media-dialog-display, inline-flex);
        justify-content: center;
        align-items: center;
        
        transition-behavior: allow-discrete;
        visibility: hidden;
        opacity: 0;
        transform: translateY(2px) scale(.99);
        pointer-events: none;
      }

      :host([open]) {
        transition: display .2s, visibility 0s, opacity .2s ease-out, transform .15s ease-out;
        visibility: visible;
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
      }

      #content {
        display: flex;
        position: relative;
        box-sizing: border-box;
        width: min(320px, 100%);
        word-wrap: break-word;
        max-height: 100%;
        overflow: auto;
        text-align: center;
        line-height: 1.4;
      }
    </style>
    ${this.getSlotTemplateHTML(e)}
  `}function k1(e){return`
    <slot id="content"></slot>
  `}const Sn={OPEN:"open",ANCHOR:"anchor"};class sr extends b.HTMLElement{constructor(){super(),Ii(this,mo),Ii(this,Tu),Ii(this,Au),Ii(this,ku),Ii(this,wu),Ii(this,Su),Ii(this,ho,!1),Ii(this,wn,null),Ii(this,Ta,null)}static get observedAttributes(){return[Sn.OPEN,Sn.ANCHOR]}get open(){return j(this,Sn.OPEN)}set open(t){X(this,Sn.OPEN,t)}handleEvent(t){switch(t.type){case"invoke":ya(this,ku,Zp).call(this,t);break;case"focusout":ya(this,wu,jp).call(this,t);break;case"keydown":ya(this,Su,Xp).call(this,t);break}}connectedCallback(){ya(this,mo,yu).call(this),this.role||(this.role="dialog"),this.addEventListener("invoke",this),this.addEventListener("focusout",this),this.addEventListener("keydown",this)}disconnectedCallback(){this.removeEventListener("invoke",this),this.removeEventListener("focusout",this),this.removeEventListener("keydown",this)}attributeChangedCallback(t,i,a){ya(this,mo,yu).call(this),t===Sn.OPEN&&a!==i&&(this.open?ya(this,Tu,zp).call(this):ya(this,Au,Qp).call(this))}focus(){gu(this,wn,Xd());const t=!this.dispatchEvent(new Event("focus",{composed:!0,cancelable:!0})),i=!this.dispatchEvent(new Event("focusin",{composed:!0,bubbles:!0,cancelable:!0}));if(t||i)return;const a=this.querySelector('[autofocus], [tabindex]:not([tabindex="-1"]), [role="menu"]');a==null||a.focus()}get keysUsed(){return["Escape","Tab"]}}ho=new WeakMap,wn=new WeakMap,Ta=new WeakMap,mo=new WeakSet,yu=function(){if(!ga(this,ho)&&(gu(this,ho,!0),!this.shadowRoot)){this.attachShadow(this.constructor.shadowRootOptions);const e=ut(this.attributes);this.shadowRoot.innerHTML=this.constructor.getTemplateHTML(e),queueMicrotask(()=>{const{style:t}=Pe(this.shadowRoot,":host");t.setProperty("transition","display .15s, visibility .15s, opacity .15s ease-in, transform .15s ease-in")})}},Tu=new WeakSet,zp=function(){var e;(e=ga(this,Ta))==null||e.setAttribute("aria-expanded","true"),this.dispatchEvent(new Event("open",{composed:!0,bubbles:!0})),this.addEventListener("transitionend",()=>this.focus(),{once:!0})},Au=new WeakSet,Qp=function(){var e;(e=ga(this,Ta))==null||e.setAttribute("aria-expanded","false"),this.dispatchEvent(new Event("close",{composed:!0,bubbles:!0}))},ku=new WeakSet,Zp=function(e){gu(this,Ta,e.relatedTarget),ki(this,e.relatedTarget)||(this.open=!this.open)},wu=new WeakSet,jp=function(e){var t;ki(this,e.relatedTarget)||((t=ga(this,wn))==null||t.focus(),ga(this,Ta)&&ga(this,Ta)!==e.relatedTarget&&this.open&&(this.open=!1))},Su=new WeakSet,Xp=function(e){var t,i,a,r,n;const{key:s,ctrlKey:o,altKey:l,metaKey:c}=e;o||l||c||this.keysUsed.includes(s)&&(e.preventDefault(),e.stopPropagation(),s==="Tab"?(e.shiftKey?(i=(t=this.previousElementSibling)==null?void 0:t.focus)==null||i.call(t):(r=(a=this.nextElementSibling)==null?void 0:a.focus)==null||r.call(a),this.blur()):s==="Escape"&&((n=ga(this,wn))==null||n.focus(),this.open=!1))},sr.shadowRootOptions={mode:"open"},sr.getTemplateHTML=A1,sr.getSlotTemplateHTML=k1,b.customElements.get("media-chrome-dialog")||b.customElements.define("media-chrome-dialog",sr);var Zw=null,Iu=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},ye=(e,t,i)=>(Iu(e,t,"read from private field"),i?i.call(e):t.get(e)),qe=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},Yi=(e,t,i,a)=>(Iu(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),Pt=(e,t,i)=>(Iu(e,t,"access private method"),i),Jt,po,vo,_o,Ut,fo,Eo,bo,go,Ru,Jp,yo,Lu,To,Cu,Ao,Mu,Du,ev,xu,tv,Ou,iv,Nu,av;function w1(e){return`
    <style>
      :host {
        --_focus-box-shadow: var(--media-focus-box-shadow, inset 0 0 0 2px rgb(27 127 204 / .9));
        --_media-range-padding: var(--media-range-padding, var(--media-control-padding, 10px));

        box-shadow: var(--_focus-visible-box-shadow, none);
        background: var(--media-control-background, var(--media-secondary-color, rgb(20 20 30 / .7)));
        height: calc(var(--media-control-height, 24px) + 2 * var(--_media-range-padding));
        display: inline-flex;
        align-items: center;
        
        vertical-align: middle;
        box-sizing: border-box;
        position: relative;
        width: 100px;
        transition: background .15s linear;
        cursor: var(--media-cursor, pointer);
        pointer-events: auto;
        touch-action: none; 
      }

      
      input[type=range]:focus {
        outline: 0;
      }
      input[type=range]:focus::-webkit-slider-runnable-track {
        outline: 0;
      }

      :host(:hover) {
        background: var(--media-control-hover-background, rgb(50 50 70 / .7));
      }

      #leftgap {
        padding-left: var(--media-range-padding-left, var(--_media-range-padding));
      }

      #rightgap {
        padding-right: var(--media-range-padding-right, var(--_media-range-padding));
      }

      #startpoint,
      #endpoint {
        position: absolute;
      }

      #endpoint {
        right: 0;
      }

      #container {
        
        width: var(--media-range-track-width, 100%);
        transform: translate(var(--media-range-track-translate-x, 0px), var(--media-range-track-translate-y, 0px));
        position: relative;
        height: 100%;
        display: flex;
        align-items: center;
        min-width: 40px;
      }

      #range {
        
        display: var(--media-time-range-hover-display, block);
        bottom: var(--media-time-range-hover-bottom, 0);
        height: var(--media-time-range-hover-height, max(100% , 25px));
        width: 100%;
        position: absolute;
        cursor: var(--media-cursor, pointer);

        -webkit-appearance: none; 
        -webkit-tap-highlight-color: transparent;
        background: transparent; 
        margin: 0;
        z-index: 1;
      }

      @media (hover: hover) {
        #range {
          bottom: var(--media-time-range-hover-bottom, 0);
          height: var(--media-time-range-hover-height, max(100%, 20px));
        }
      }

      
      
      #range::-webkit-slider-thumb {
        -webkit-appearance: none;
        background: transparent;
        width: .1px;
        height: .1px;
      }

      
      #range::-moz-range-thumb {
        background: transparent;
        border: transparent;
        width: .1px;
        height: .1px;
      }

      #appearance {
        height: var(--media-range-track-height, 4px);
        display: flex;
        flex-direction: column;
        justify-content: center;
        width: 100%;
        position: absolute;
        
        will-change: transform;
      }

      #track {
        background: var(--media-range-track-background, rgb(255 255 255 / .2));
        border-radius: var(--media-range-track-border-radius, 1px);
        border: var(--media-range-track-border, none);
        outline: var(--media-range-track-outline);
        outline-offset: var(--media-range-track-outline-offset);
        backdrop-filter: var(--media-range-track-backdrop-filter);
        -webkit-backdrop-filter: var(--media-range-track-backdrop-filter);
        box-shadow: var(--media-range-track-box-shadow, none);
        position: absolute;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }

      #progress,
      #pointer {
        position: absolute;
        height: 100%;
        will-change: width;
      }

      #progress {
        background: var(--media-range-bar-color, var(--media-primary-color, rgb(238 238 238)));
        transition: var(--media-range-track-transition);
      }

      #pointer {
        background: var(--media-range-track-pointer-background);
        border-right: var(--media-range-track-pointer-border-right);
        transition: visibility .25s, opacity .25s;
        visibility: hidden;
        opacity: 0;
      }

      @media (hover: hover) {
        :host(:hover) #pointer {
          transition: visibility .5s, opacity .5s;
          visibility: visible;
          opacity: 1;
        }
      }

      #thumb,
      ::slotted([slot=thumb]) {
        width: var(--media-range-thumb-width, 10px);
        height: var(--media-range-thumb-height, 10px);
        transition: var(--media-range-thumb-transition);
        transform: var(--media-range-thumb-transform, none);
        opacity: var(--media-range-thumb-opacity, 1);
        translate: -50%;
        position: absolute;
        left: 0;
        cursor: var(--media-cursor, pointer);
      }

      #thumb {
        border-radius: var(--media-range-thumb-border-radius, 10px);
        background: var(--media-range-thumb-background, var(--media-primary-color, rgb(238 238 238)));
        box-shadow: var(--media-range-thumb-box-shadow, 1px 1px 1px transparent);
        border: var(--media-range-thumb-border, none);
      }

      :host([disabled]) #thumb {
        background-color: #777;
      }

      .segments #appearance {
        height: var(--media-range-segment-hover-height, 7px);
      }

      #track {
        clip-path: url(#segments-clipping);
      }

      #segments {
        --segments-gap: var(--media-range-segments-gap, 2px);
        position: absolute;
        width: 100%;
        height: 100%;
      }

      #segments-clipping {
        transform: translateX(calc(var(--segments-gap) / 2));
      }

      #segments-clipping:empty {
        display: none;
      }

      #segments-clipping rect {
        height: var(--media-range-track-height, 4px);
        y: calc((var(--media-range-segment-hover-height, 7px) - var(--media-range-track-height, 4px)) / 2);
        transition: var(--media-range-segment-transition, transform .1s ease-in-out);
        transform: var(--media-range-segment-transform, scaleY(1));
        transform-origin: center;
      }

      /* Visible label for accessibility - positioned off-screen but technically visible (Firefox requires visible labels) */
      #range-label {
        position: absolute;
        left: -10000px;
        background: var(--media-control-background, var(--media-secondary-color, rgb(20 20 30 / .7)));
        pointer-events: none;
      }
    </style>
    <div id="leftgap"></div>
    <div id="container">
      <div id="startpoint"></div>
      <div id="endpoint"></div>
      <div id="appearance">
        <div id="track" part="track">
          <div id="pointer"></div>
          <div id="progress" part="progress"></div>
        </div>
        <slot name="thumb">
          <div id="thumb" part="thumb"></div>
        </slot>
        <svg id="segments" aria-hidden="true"><clipPath id="segments-clipping"></clipPath></svg>
      </div>
        <input id="range" type="range" min="0" max="1" step="any" value="0">
        <label for="range" id="range-label"></label>

      ${this.getContainerTemplateHTML(e)}
    </div>
    <div id="rightgap"></div>
  `}function S1(e){return""}class or extends b.HTMLElement{constructor(){if(super(),qe(this,Ru),qe(this,yo),qe(this,To),qe(this,Ao),qe(this,Du),qe(this,xu),qe(this,Ou),qe(this,Nu),qe(this,Jt,void 0),qe(this,po,void 0),qe(this,vo,void 0),qe(this,_o,void 0),qe(this,Ut,{}),qe(this,fo,[]),qe(this,Eo,()=>{if(this.range.matches(":focus-visible")){const{style:t}=Pe(this.shadowRoot,":host");t.setProperty("--_focus-visible-box-shadow","var(--_focus-box-shadow)")}}),qe(this,bo,()=>{const{style:t}=Pe(this.shadowRoot,":host");t.removeProperty("--_focus-visible-box-shadow")}),qe(this,go,()=>{const t=this.shadowRoot.querySelector("#segments-clipping");t&&t.parentNode.append(t)}),!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);const t=ut(this.attributes),i=this.constructor.getTemplateHTML(t);this.shadowRoot.setHTMLUnsafe?this.shadowRoot.setHTMLUnsafe(i):this.shadowRoot.innerHTML=i}this.container=this.shadowRoot.querySelector("#container"),Yi(this,vo,this.shadowRoot.querySelector("#startpoint")),Yi(this,_o,this.shadowRoot.querySelector("#endpoint")),this.range=this.shadowRoot.querySelector("#range"),this.appearance=this.shadowRoot.querySelector("#appearance")}static get observedAttributes(){return["disabled","aria-disabled",ae.MEDIA_CONTROLLER]}attributeChangedCallback(t,i,a){var r,n,s,o,l;t===ae.MEDIA_CONTROLLER?(i&&((n=(r=ye(this,Jt))==null?void 0:r.unassociateElement)==null||n.call(r,this),Yi(this,Jt,null)),a&&this.isConnected&&(Yi(this,Jt,(s=this.getRootNode())==null?void 0:s.getElementById(a)),(l=(o=ye(this,Jt))==null?void 0:o.associateElement)==null||l.call(o,this))):(t==="disabled"||t==="aria-disabled"&&i!==a)&&(a==null?(this.range.removeAttribute(t),Pt(this,yo,Lu).call(this)):(this.range.setAttribute(t,a),Pt(this,To,Cu).call(this)))}connectedCallback(){var t,i,a;const{style:r}=Pe(this.shadowRoot,":host");r.setProperty("display",`var(--media-control-display, var(--${this.localName}-display, inline-flex))`),ye(this,Ut).pointer=Pe(this.shadowRoot,"#pointer"),ye(this,Ut).progress=Pe(this.shadowRoot,"#progress"),ye(this,Ut).thumb=Pe(this.shadowRoot,'#thumb, ::slotted([slot="thumb"])'),ye(this,Ut).activeSegment=Pe(this.shadowRoot,"#segments-clipping rect:nth-child(0)");const n=this.getAttribute(ae.MEDIA_CONTROLLER);n&&(Yi(this,Jt,(t=this.getRootNode())==null?void 0:t.getElementById(n)),(a=(i=ye(this,Jt))==null?void 0:i.associateElement)==null||a.call(i,this)),this.updateBar(),this.shadowRoot.addEventListener("focusin",ye(this,Eo)),this.shadowRoot.addEventListener("focusout",ye(this,bo)),Pt(this,yo,Lu).call(this),Ya(this.container,ye(this,go))}disconnectedCallback(){var t,i;Pt(this,To,Cu).call(this),(i=(t=ye(this,Jt))==null?void 0:t.unassociateElement)==null||i.call(t,this),Yi(this,Jt,null),this.shadowRoot.removeEventListener("focusin",ye(this,Eo)),this.shadowRoot.removeEventListener("focusout",ye(this,bo)),Ga(this.container,ye(this,go))}updatePointerBar(t){var i;(i=ye(this,Ut).pointer)==null||i.style.setProperty("width",`${this.getPointerRatio(t)*100}%`)}updateBar(){var t,i;const a=this.range.valueAsNumber*100;(t=ye(this,Ut).progress)==null||t.style.setProperty("width",`${a}%`),(i=ye(this,Ut).thumb)==null||i.style.setProperty("left",`${a}%`)}updateSegments(t){const i=this.shadowRoot.querySelector("#segments-clipping");if(i.textContent="",this.container.classList.toggle("segments",!!(t!=null&&t.length)),!(t!=null&&t.length))return;const a=[...new Set([+this.range.min,...t.flatMap(n=>[n.start,n.end]),+this.range.max])];Yi(this,fo,[...a]);const r=a.pop();for(const[n,s]of a.entries()){const[o,l]=[n===0,n===a.length-1],c=o?"calc(var(--segments-gap) / -1)":`${s*100}%`,v=`calc(${((l?r:a[n+1])-s)*100}%${o||l?"":" - var(--segments-gap)"})`,d=Le.createElementNS("http://www.w3.org/2000/svg","rect"),u=Jd(this.shadowRoot,`#segments-clipping rect:nth-child(${n+1})`);u.style.setProperty("x",c),u.style.setProperty("width",v),i.append(d)}}getPointerRatio(t){return Ey(t.clientX,t.clientY,ye(this,vo).getBoundingClientRect(),ye(this,_o).getBoundingClientRect())}get dragging(){return this.hasAttribute("dragging")}handleEvent(t){switch(t.type){case"pointermove":Pt(this,Nu,av).call(this,t);break;case"input":this.updateBar();break;case"pointerenter":Pt(this,Du,ev).call(this,t);break;case"pointerdown":Pt(this,Ao,Mu).call(this,t);break;case"pointerup":Pt(this,xu,tv).call(this);break;case"pointerleave":Pt(this,Ou,iv).call(this);break}}get keysUsed(){return["ArrowUp","ArrowRight","ArrowDown","ArrowLeft"]}}Jt=new WeakMap,po=new WeakMap,vo=new WeakMap,_o=new WeakMap,Ut=new WeakMap,fo=new WeakMap,Eo=new WeakMap,bo=new WeakMap,go=new WeakMap,Ru=new WeakSet,Jp=function(e){const t=ye(this,Ut).activeSegment;if(!t)return;const i=this.getPointerRatio(e),r=`#segments-clipping rect:nth-child(${ye(this,fo).findIndex((n,s,o)=>{const l=o[s+1];return l!=null&&i>=n&&i<=l})+1})`;(t.selectorText!=r||!t.style.transform)&&(t.selectorText=r,t.style.setProperty("transform","var(--media-range-segment-hover-transform, scaleY(2))"))},yo=new WeakSet,Lu=function(){this.hasAttribute("disabled")||!this.isConnected||(this.addEventListener("input",this),this.addEventListener("pointerdown",this),this.addEventListener("pointerenter",this))},To=new WeakSet,Cu=function(){var e,t;this.removeEventListener("input",this),this.removeEventListener("pointerdown",this),this.removeEventListener("pointerenter",this),this.removeEventListener("pointerleave",this),(e=b.window)==null||e.removeEventListener("pointerup",this),(t=b.window)==null||t.removeEventListener("pointermove",this)},Ao=new WeakSet,Mu=function(e){var t;Yi(this,po,e.composedPath().includes(this.range)),(t=b.window)==null||t.addEventListener("pointerup",this,{once:!0})},Du=new WeakSet,ev=function(e){var t;e.pointerType!=="mouse"&&Pt(this,Ao,Mu).call(this,e),this.addEventListener("pointerleave",this,{once:!0}),(t=b.window)==null||t.addEventListener("pointermove",this)},xu=new WeakSet,tv=function(){var e;(e=b.window)==null||e.removeEventListener("pointerup",this),this.toggleAttribute("dragging",!1),this.range.disabled=this.hasAttribute("disabled")},Ou=new WeakSet,iv=function(){var e,t;this.removeEventListener("pointerleave",this),(e=b.window)==null||e.removeEventListener("pointermove",this),this.toggleAttribute("dragging",!1),this.range.disabled=this.hasAttribute("disabled"),(t=ye(this,Ut).activeSegment)==null||t.style.removeProperty("transform")},Nu=new WeakSet,av=function(e){e.pointerType==="pen"&&e.buttons===0||(this.toggleAttribute("dragging",e.buttons===1||e.pointerType!=="mouse"),this.updatePointerBar(e),Pt(this,Ru,Jp).call(this,e),this.dragging&&(e.pointerType!=="mouse"||!ye(this,po))&&(this.range.disabled=!0,this.range.valueAsNumber=this.getPointerRatio(e),this.range.dispatchEvent(new Event("input",{bubbles:!0,composed:!0}))))},or.shadowRootOptions={mode:"open"},or.getTemplateHTML=w1,or.getContainerTemplateHTML=S1,b.customElements.get("media-chrome-range")||b.customElements.define("media-chrome-range",or);var jw=null,rv=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},ko=(e,t,i)=>(rv(e,t,"read from private field"),i?i.call(e):t.get(e)),I1=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},wo=(e,t,i,a)=>(rv(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),ei;function R1(e){return`
    <style>
      :host {
        
        box-sizing: border-box;
        display: var(--media-control-display, var(--media-control-bar-display, inline-flex));
        color: var(--media-text-color, var(--media-primary-color, rgb(238 238 238)));
        --media-loading-indicator-icon-height: 44px;
      }

      ::slotted(media-time-range),
      ::slotted(media-volume-range) {
        min-height: 100%;
      }

      ::slotted(media-time-range),
      ::slotted(media-clip-selector) {
        flex-grow: 1;
      }

      ::slotted([role="menu"]) {
        position: absolute;
      }
    </style>

    <slot></slot>
  `}class Pu extends b.HTMLElement{constructor(){if(super(),I1(this,ei,void 0),!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);const t=ut(this.attributes);this.shadowRoot.innerHTML=this.constructor.getTemplateHTML(t)}}static get observedAttributes(){return[ae.MEDIA_CONTROLLER]}attributeChangedCallback(t,i,a){var r,n,s,o,l;t===ae.MEDIA_CONTROLLER&&(i&&((n=(r=ko(this,ei))==null?void 0:r.unassociateElement)==null||n.call(r,this),wo(this,ei,null)),a&&this.isConnected&&(wo(this,ei,(s=this.getRootNode())==null?void 0:s.getElementById(a)),(l=(o=ko(this,ei))==null?void 0:o.associateElement)==null||l.call(o,this)))}connectedCallback(){var t,i,a;const r=this.getAttribute(ae.MEDIA_CONTROLLER);r&&(wo(this,ei,(t=this.getRootNode())==null?void 0:t.getElementById(r)),(a=(i=ko(this,ei))==null?void 0:i.associateElement)==null||a.call(i,this))}disconnectedCallback(){var t,i;(i=(t=ko(this,ei))==null?void 0:t.unassociateElement)==null||i.call(t,this),wo(this,ei,null)}}ei=new WeakMap,Pu.shadowRootOptions={mode:"open"},Pu.getTemplateHTML=R1,b.customElements.get("media-control-bar")||b.customElements.define("media-control-bar",Pu);var Xw=null,nv=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},So=(e,t,i)=>(nv(e,t,"read from private field"),i?i.call(e):t.get(e)),L1=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},Io=(e,t,i,a)=>(nv(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),ti;function C1(e,t={}){return`
    <style>
      :host {
        font: var(--media-font,
          var(--media-font-weight, normal)
          var(--media-font-size, 14px) /
          var(--media-text-content-height, var(--media-control-height, 24px))
          var(--media-font-family, helvetica neue, segoe ui, roboto, arial, sans-serif));
        color: var(--media-text-color, var(--media-primary-color, rgb(238 238 238)));
        background: var(--media-text-background, var(--media-control-background, var(--media-secondary-color, rgb(20 20 30 / .7))));
        padding: var(--media-control-padding, 10px);
        display: inline-flex;
        justify-content: center;
        align-items: center;
        vertical-align: middle;
        box-sizing: border-box;
        text-align: center;
        pointer-events: auto;
      }

      
      :host(:focus-visible) {
        box-shadow: var(--media-focus-box-shadow, inset 0 0 0 2px rgb(27 127 204 / .9));
        outline: 0;
      }

      
      :host(:where(:focus)) {
        box-shadow: none;
        outline: 0;
      }
    </style>

    ${this.getSlotTemplateHTML(e,t)}
  `}function M1(e,t){return`
    <slot></slot>
  `}class Gi extends b.HTMLElement{constructor(){if(super(),L1(this,ti,void 0),!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);const t=ut(this.attributes);this.shadowRoot.innerHTML=this.constructor.getTemplateHTML(t)}}static get observedAttributes(){return[ae.MEDIA_CONTROLLER]}attributeChangedCallback(t,i,a){var r,n,s,o,l;t===ae.MEDIA_CONTROLLER&&(i&&((n=(r=So(this,ti))==null?void 0:r.unassociateElement)==null||n.call(r,this),Io(this,ti,null)),a&&this.isConnected&&(Io(this,ti,(s=this.getRootNode())==null?void 0:s.getElementById(a)),(l=(o=So(this,ti))==null?void 0:o.associateElement)==null||l.call(o,this)))}connectedCallback(){var t,i,a;const{style:r}=Pe(this.shadowRoot,":host");r.setProperty("display",`var(--media-control-display, var(--${this.localName}-display, inline-flex))`);const n=this.getAttribute(ae.MEDIA_CONTROLLER);n&&(Io(this,ti,(t=this.getRootNode())==null?void 0:t.getElementById(n)),(a=(i=So(this,ti))==null?void 0:i.associateElement)==null||a.call(i,this))}disconnectedCallback(){var t,i;(i=(t=So(this,ti))==null?void 0:t.unassociateElement)==null||i.call(t,this),Io(this,ti,null)}}ti=new WeakMap,Gi.shadowRootOptions={mode:"open"},Gi.getTemplateHTML=C1,Gi.getSlotTemplateHTML=M1,b.customElements.get("media-text-display")||b.customElements.define("media-text-display",Gi);var Jw=null,sv=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},ov=(e,t,i)=>(sv(e,t,"read from private field"),i?i.call(e):t.get(e)),D1=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},x1=(e,t,i,a)=>(sv(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),In;function O1(e,t){return`
    <slot>${Fi(t.mediaDuration)}</slot>
  `}class lv extends Gi{constructor(){var t;super(),D1(this,In,void 0),x1(this,In,this.shadowRoot.querySelector("slot")),ov(this,In).textContent=Fi((t=this.mediaDuration)!=null?t:0)}static get observedAttributes(){return[...super.observedAttributes,h.MEDIA_DURATION]}attributeChangedCallback(t,i,a){t===h.MEDIA_DURATION&&(ov(this,In).textContent=Fi(+a)),super.attributeChangedCallback(t,i,a)}get mediaDuration(){return ce(this,h.MEDIA_DURATION)}set mediaDuration(t){ge(this,h.MEDIA_DURATION,t)}}In=new WeakMap,lv.getSlotTemplateHTML=O1,b.customElements.get("media-duration-display")||b.customElements.define("media-duration-display",lv);var eS=null;const N1={2:D("Network Error"),3:D("Decode Error"),4:D("Source Not Supported"),5:D("Encryption Error")},P1={2:D("A network error caused the media download to fail."),3:D("A media error caused playback to be aborted. The media could be corrupt or your browser does not support this format."),4:D("An unsupported error occurred. The server or network failed, or your browser does not support this format."),5:D("The media is encrypted and there are no keys to decrypt it.")},Uu=e=>{var t,i;return e.code===1?null:{title:(t=N1[e.code])!=null?t:`Error ${e.code}`,message:(i=P1[e.code])!=null?i:e.message}};var dv=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},U1=(e,t,i)=>(dv(e,t,"read from private field"),i?i.call(e):t.get(e)),B1=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},H1=(e,t,i,a)=>(dv(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),Ro;function W1(e){return`
    <style>
      :host {
        background: rgb(20 20 30 / .8);
      }

      #content {
        display: block;
        padding: 1.2em 1.5em;
      }

      h3,
      p {
        margin-block: 0 .3em;
      }
    </style>
    <slot name="error-${e.mediaerrorcode}" id="content">
      ${uv({code:+e.mediaerrorcode,message:e.mediaerrormessage})}
    </slot>
  `}function F1(e){return e.code&&Uu(e)!==null}function uv(e){var t;const{title:i,message:a}=(t=Uu(e))!=null?t:{};let r="";return i&&(r+=`<slot name="error-${e.code}-title"><h3>${i}</h3></slot>`),a&&(r+=`<slot name="error-${e.code}-message"><p>${a}</p></slot>`),r}const cv=[h.MEDIA_ERROR_CODE,h.MEDIA_ERROR_MESSAGE];class Lo extends sr{constructor(){super(...arguments),B1(this,Ro,null)}static get observedAttributes(){return[...super.observedAttributes,...cv]}formatErrorMessage(t){return this.constructor.formatErrorMessage(t)}attributeChangedCallback(t,i,a){var r;if(super.attributeChangedCallback(t,i,a),!cv.includes(t))return;const n=(r=this.mediaError)!=null?r:{code:this.mediaErrorCode,message:this.mediaErrorMessage};if(this.open=F1(n),this.open&&(this.shadowRoot.querySelector("slot").name=`error-${this.mediaErrorCode}`,this.shadowRoot.querySelector("#content").innerHTML=this.formatErrorMessage(n),!this.hasAttribute("aria-label"))){const{title:s}=Uu(n);s&&this.setAttribute("aria-label",s)}}get mediaError(){return U1(this,Ro)}set mediaError(t){H1(this,Ro,t)}get mediaErrorCode(){return ce(this,"mediaerrorcode")}set mediaErrorCode(t){ge(this,"mediaerrorcode",t)}get mediaErrorMessage(){return _e(this,"mediaerrormessage")}set mediaErrorMessage(t){me(this,"mediaerrormessage",t)}}Ro=new WeakMap,Lo.getSlotTemplateHTML=W1,Lo.formatErrorMessage=uv,b.customElements.get("media-error-dialog")||b.customElements.define("media-error-dialog",Lo);var hv=Lo,K1=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},zi=(e,t,i)=>(K1(e,t,"read from private field"),i?i.call(e):t.get(e)),mv=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},lr,dr;function $1(e){return`
    <style>
      :host {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 9999;
        background: rgb(20 20 30 / .8);
        backdrop-filter: blur(10px);
      }

      #content {
        display: block;
        width: clamp(400px, 40vw, 700px);
        max-width: 90vw;
        text-align: left;
      }

      h2 {
        margin: 0 0 1.5rem 0;
        font-size: 1.5rem;
        font-weight: 500;
        text-align: center;
      }

      .shortcuts-table {
        width: 100%;
        border-collapse: collapse;
      }

      .shortcuts-table tr {
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .shortcuts-table tr:last-child {
        border-bottom: none;
      }

      .shortcuts-table td {
        padding: 0.75rem 0.5rem;
      }

      .shortcuts-table td:first-child {
        text-align: right;
        padding-right: 1rem;
        width: 40%;
        min-width: 120px;
      }

      .shortcuts-table td:last-child {
        padding-left: 1rem;
      }

      .key {
        display: inline-block;
        background: rgba(255, 255, 255, 0.15);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 4px;
        padding: 0.25rem 0.5rem;
        font-family: 'Courier New', monospace;
        font-size: 0.9rem;
        font-weight: 500;
        min-width: 1.5rem;
        text-align: center;
        margin: 0 0.2rem;
      }

      .description {
        color: rgba(255, 255, 255, 0.9);
        font-size: 0.95rem;
      }

      .key-combo {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0.3rem;
      }

      .key-separator {
        color: rgba(255, 255, 255, 0.5);
        font-size: 0.9rem;
      }
    </style>
    <slot id="content">
      ${V1()}
    </slot>
  `}function V1(){return`
    <h2>Keyboard Shortcuts</h2>
    <table class="shortcuts-table">${[{keys:["Space","k"],description:"Toggle Playback"},{keys:["m"],description:"Toggle mute"},{keys:["f"],description:"Toggle fullscreen"},{keys:["c"],description:"Toggle captions or subtitles, if available"},{keys:["p"],description:"Toggle Picture in Picture"},{keys:["\u2190","j"],description:"Seek back 10s"},{keys:["\u2192","l"],description:"Seek forward 10s"},{keys:["\u2191"],description:"Turn volume up"},{keys:["\u2193"],description:"Turn volume down"},{keys:["< (SHIFT+,)"],description:"Decrease playback rate"},{keys:["> (SHIFT+.)"],description:"Increase playback rate"}].map(({keys:i,description:a})=>`
      <tr>
        <td>
          <div class="key-combo">${i.map((n,s)=>s>0?`<span class="key-separator">or</span><span class="key">${n}</span>`:`<span class="key">${n}</span>`).join("")}</div>
        </td>
        <td class="description">${a}</td>
      </tr>
    `).join("")}</table>
  `}class pv extends sr{constructor(){super(...arguments),mv(this,lr,t=>{var i;if(!this.open)return;const a=(i=this.shadowRoot)==null?void 0:i.querySelector("#content");if(!a)return;const r=t.composedPath(),n=r[0]===this||r.includes(this),s=r.includes(a);n&&!s&&(this.open=!1)}),mv(this,dr,t=>{if(!this.open)return;const i=t.shiftKey&&(t.key==="/"||t.key==="?");(t.key==="Escape"||i)&&!t.ctrlKey&&!t.altKey&&!t.metaKey&&(this.open=!1,t.preventDefault(),t.stopPropagation())})}connectedCallback(){super.connectedCallback(),this.open&&(this.addEventListener("click",zi(this,lr)),document.addEventListener("keydown",zi(this,dr)))}disconnectedCallback(){this.removeEventListener("click",zi(this,lr)),document.removeEventListener("keydown",zi(this,dr))}attributeChangedCallback(t,i,a){super.attributeChangedCallback(t,i,a),t==="open"&&(this.open?(this.addEventListener("click",zi(this,lr)),document.addEventListener("keydown",zi(this,dr))):(this.removeEventListener("click",zi(this,lr)),document.removeEventListener("keydown",zi(this,dr))))}}lr=new WeakMap,dr=new WeakMap,pv.getSlotTemplateHTML=$1,b.customElements.get("media-keyboard-shortcuts-dialog")||b.customElements.define("media-keyboard-shortcuts-dialog",pv);var tS=null,vv=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},q1=(e,t,i)=>(vv(e,t,"read from private field"),i?i.call(e):t.get(e)),Y1=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},G1=(e,t,i,a)=>(vv(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),Co;const z1=`<svg aria-hidden="true" viewBox="0 0 26 24">
  <path d="M16 3v2.5h3.5V9H22V3h-6ZM4 9h2.5V5.5H10V3H4v6Zm15.5 9.5H16V21h6v-6h-2.5v3.5ZM6.5 15H4v6h6v-2.5H6.5V15Z"/>
</svg>`,Q1=`<svg aria-hidden="true" viewBox="0 0 26 24">
  <path d="M18.5 6.5V3H16v6h6V6.5h-3.5ZM16 21h2.5v-3.5H22V15h-6v6ZM4 17.5h3.5V21H10v-6H4v2.5Zm3.5-11H4V9h6V3H7.5v3.5Z"/>
</svg>`;function Z1(e){return`
    <style>
      :host([${h.MEDIA_IS_FULLSCREEN}]) slot[name=icon] slot:not([name=exit]) {
        display: none !important;
      }

      
      :host(:not([${h.MEDIA_IS_FULLSCREEN}])) slot[name=icon] slot:not([name=enter]) {
        display: none !important;
      }

      :host([${h.MEDIA_IS_FULLSCREEN}]) slot[name=tooltip-enter],
      :host(:not([${h.MEDIA_IS_FULLSCREEN}])) slot[name=tooltip-exit] {
        display: none;
      }
    </style>

    <slot name="icon">
      <slot name="enter">${z1}</slot>
      <slot name="exit">${Q1}</slot>
    </slot>
  `}function j1(){return`
    <slot name="tooltip-enter">${D("Enter fullscreen mode")}</slot>
    <slot name="tooltip-exit">${D("Exit fullscreen mode")}</slot>
  `}const _v=e=>{const t=e.mediaIsFullscreen?D("exit fullscreen mode"):D("enter fullscreen mode");e.setAttribute("aria-label",t)};class Bu extends Fe{constructor(){super(...arguments),Y1(this,Co,null)}static get observedAttributes(){return[...super.observedAttributes,h.MEDIA_IS_FULLSCREEN,h.MEDIA_FULLSCREEN_UNAVAILABLE]}connectedCallback(){super.connectedCallback(),_v(this)}attributeChangedCallback(t,i,a){super.attributeChangedCallback(t,i,a),t===h.MEDIA_IS_FULLSCREEN&&_v(this)}get mediaFullscreenUnavailable(){return _e(this,h.MEDIA_FULLSCREEN_UNAVAILABLE)}set mediaFullscreenUnavailable(t){me(this,h.MEDIA_FULLSCREEN_UNAVAILABLE,t)}get mediaIsFullscreen(){return j(this,h.MEDIA_IS_FULLSCREEN)}set mediaIsFullscreen(t){X(this,h.MEDIA_IS_FULLSCREEN,t)}handleClick(t){G1(this,Co,t);const i=q1(this,Co)instanceof PointerEvent,a=this.mediaIsFullscreen?new b.CustomEvent(x.MEDIA_EXIT_FULLSCREEN_REQUEST,{composed:!0,bubbles:!0}):new b.CustomEvent(x.MEDIA_ENTER_FULLSCREEN_REQUEST,{composed:!0,bubbles:!0,detail:i});this.dispatchEvent(a)}}Co=new WeakMap,Bu.getSlotTemplateHTML=Z1,Bu.getTooltipContentHTML=j1,b.customElements.get("media-fullscreen-button")||b.customElements.define("media-fullscreen-button",Bu);var iS=null;const{MEDIA_TIME_IS_LIVE:Mo,MEDIA_PAUSED:Rn}=h,{MEDIA_SEEK_TO_LIVE_REQUEST:X1,MEDIA_PLAY_REQUEST:J1}=x,eT='<svg viewBox="0 0 6 12" aria-hidden="true"><circle cx="3" cy="6" r="2"></circle></svg>';function tT(e){return`
    <style>
      :host { --media-tooltip-display: none; }
      
      slot[name=indicator] > *,
      :host ::slotted([slot=indicator]) {
        
        min-width: auto;
        fill: var(--media-live-button-icon-color, rgb(140, 140, 140));
        color: var(--media-live-button-icon-color, rgb(140, 140, 140));
      }

      :host([${Mo}]:not([${Rn}])) slot[name=indicator] > *,
      :host([${Mo}]:not([${Rn}])) ::slotted([slot=indicator]) {
        fill: var(--media-live-button-indicator-color, rgb(255, 0, 0));
        color: var(--media-live-button-indicator-color, rgb(255, 0, 0));
      }

      :host([${Mo}]:not([${Rn}])) {
        cursor: var(--media-cursor, not-allowed);
      }

      slot[name=text]{
        text-transform: uppercase;
      }

    </style>

    <slot name="indicator">${eT}</slot>
    
    <slot name="spacer">&nbsp;</slot><slot name="text">${D("live")}</slot>
  `}const fv=e=>{var t;const i=e.mediaPaused||!e.mediaTimeIsLive,a=D(i?"seek to live":"playing live");e.setAttribute("aria-label",a);const r=(t=e.shadowRoot)==null?void 0:t.querySelector('slot[name="text"]');r&&(r.textContent=D("live")),i?e.removeAttribute("aria-disabled"):e.setAttribute("aria-disabled","true")};class Ev extends Fe{static get observedAttributes(){return[...super.observedAttributes,Mo,Rn]}connectedCallback(){super.connectedCallback(),fv(this)}attributeChangedCallback(t,i,a){super.attributeChangedCallback(t,i,a),fv(this)}get mediaPaused(){return j(this,h.MEDIA_PAUSED)}set mediaPaused(t){X(this,h.MEDIA_PAUSED,t)}get mediaTimeIsLive(){return j(this,h.MEDIA_TIME_IS_LIVE)}set mediaTimeIsLive(t){X(this,h.MEDIA_TIME_IS_LIVE,t)}handleClick(){!this.mediaPaused&&this.mediaTimeIsLive||(this.dispatchEvent(new b.CustomEvent(X1,{composed:!0,bubbles:!0})),this.hasAttribute(Rn)&&this.dispatchEvent(new b.CustomEvent(J1,{composed:!0,bubbles:!0})))}}Ev.getSlotTemplateHTML=tT,b.customElements.get("media-live-button")||b.customElements.define("media-live-button",Ev);var aS=null,bv=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},Ln=(e,t,i)=>(bv(e,t,"read from private field"),i?i.call(e):t.get(e)),gv=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},Cn=(e,t,i,a)=>(bv(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),ii,Do;const xo={LOADING_DELAY:"loadingdelay",NO_AUTOHIDE:"noautohide"},yv=500,iT=`
<svg aria-hidden="true" viewBox="0 0 100 100">
  <path d="M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50">
    <animateTransform
       attributeName="transform"
       attributeType="XML"
       type="rotate"
       dur="1s"
       from="0 50 50"
       to="360 50 50"
       repeatCount="indefinite" />
  </path>
</svg>
`;function aT(e){return`
    <style>
      :host {
        display: var(--media-control-display, var(--media-loading-indicator-display, inline-block));
        vertical-align: middle;
        box-sizing: border-box;
        --_loading-indicator-delay: var(--media-loading-indicator-transition-delay, ${yv}ms);
      }

      #status {
        color: rgba(0,0,0,0);
        width: 0px;
        height: 0px;
      }

      :host slot[name=icon] > *,
      :host ::slotted([slot=icon]) {
        opacity: var(--media-loading-indicator-opacity, 0);
        transition: opacity 0.15s;
      }

      :host([${h.MEDIA_LOADING}]:not([${h.MEDIA_PAUSED}])) slot[name=icon] > *,
      :host([${h.MEDIA_LOADING}]:not([${h.MEDIA_PAUSED}])) ::slotted([slot=icon]) {
        opacity: var(--media-loading-indicator-opacity, 1);
        transition: opacity 0.15s var(--_loading-indicator-delay);
      }

      :host #status {
        visibility: var(--media-loading-indicator-opacity, hidden);
        transition: visibility 0.15s;
      }

      :host([${h.MEDIA_LOADING}]:not([${h.MEDIA_PAUSED}])) #status {
        visibility: var(--media-loading-indicator-opacity, visible);
        transition: visibility 0.15s var(--_loading-indicator-delay);
      }

      svg, img, ::slotted(svg), ::slotted(img) {
        width: var(--media-loading-indicator-icon-width);
        height: var(--media-loading-indicator-icon-height, 100px);
        fill: var(--media-icon-color, var(--media-primary-color, rgb(238 238 238)));
        vertical-align: middle;
      }
    </style>

    <slot name="icon">${iT}</slot>
    <div id="status" role="status" aria-live="polite">${D("media loading")}</div>
  `}class Hu extends b.HTMLElement{constructor(){if(super(),gv(this,ii,void 0),gv(this,Do,yv),!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);const t=ut(this.attributes);this.shadowRoot.innerHTML=this.constructor.getTemplateHTML(t)}}static get observedAttributes(){return[ae.MEDIA_CONTROLLER,h.MEDIA_PAUSED,h.MEDIA_LOADING,xo.LOADING_DELAY]}attributeChangedCallback(t,i,a){var r,n,s,o,l;t===xo.LOADING_DELAY&&i!==a?this.loadingDelay=Number(a):t===ae.MEDIA_CONTROLLER&&(i&&((n=(r=Ln(this,ii))==null?void 0:r.unassociateElement)==null||n.call(r,this),Cn(this,ii,null)),a&&this.isConnected&&(Cn(this,ii,(s=this.getRootNode())==null?void 0:s.getElementById(a)),(l=(o=Ln(this,ii))==null?void 0:o.associateElement)==null||l.call(o,this)))}connectedCallback(){var t,i,a;const r=this.getAttribute(ae.MEDIA_CONTROLLER);r&&(Cn(this,ii,(t=this.getRootNode())==null?void 0:t.getElementById(r)),(a=(i=Ln(this,ii))==null?void 0:i.associateElement)==null||a.call(i,this))}disconnectedCallback(){var t,i;(i=(t=Ln(this,ii))==null?void 0:t.unassociateElement)==null||i.call(t,this),Cn(this,ii,null)}get loadingDelay(){return Ln(this,Do)}set loadingDelay(t){Cn(this,Do,t);const{style:i}=Pe(this.shadowRoot,":host");i.setProperty("--_loading-indicator-delay",`var(--media-loading-indicator-transition-delay, ${t}ms)`)}get mediaPaused(){return j(this,h.MEDIA_PAUSED)}set mediaPaused(t){X(this,h.MEDIA_PAUSED,t)}get mediaLoading(){return j(this,h.MEDIA_LOADING)}set mediaLoading(t){X(this,h.MEDIA_LOADING,t)}get mediaController(){return _e(this,ae.MEDIA_CONTROLLER)}set mediaController(t){me(this,ae.MEDIA_CONTROLLER,t)}get noAutohide(){return j(this,xo.NO_AUTOHIDE)}set noAutohide(t){X(this,xo.NO_AUTOHIDE,t)}}ii=new WeakMap,Do=new WeakMap,Hu.shadowRootOptions={mode:"open"},Hu.getTemplateHTML=aT,b.customElements.get("media-loading-indicator")||b.customElements.define("media-loading-indicator",Hu);var rS=null;const rT=`<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="M16.5 12A4.5 4.5 0 0 0 14 8v2.18l2.45 2.45a4.22 4.22 0 0 0 .05-.63Zm2.5 0a6.84 6.84 0 0 1-.54 2.64L20 16.15A8.8 8.8 0 0 0 21 12a9 9 0 0 0-7-8.77v2.06A7 7 0 0 1 19 12ZM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25A6.92 6.92 0 0 1 14 18.7v2.06A9 9 0 0 0 17.69 19l2 2.05L21 19.73l-9-9L4.27 3ZM12 4 9.91 6.09 12 8.18V4Z"/>
</svg>`,Tv=`<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="M3 9v6h4l5 5V4L7 9H3Zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.47 4.47 0 0 0 2.5-4Z"/>
</svg>`,nT=`<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="M3 9v6h4l5 5V4L7 9H3Zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.47 4.47 0 0 0 2.5-4ZM14 3.23v2.06a7 7 0 0 1 0 13.42v2.06a9 9 0 0 0 0-17.54Z"/>
</svg>`;function sT(e){return`
    <style>
      :host(:not([${h.MEDIA_VOLUME_LEVEL}])) slot[name=icon] slot:not([name=high]),
      :host([${h.MEDIA_VOLUME_LEVEL}=high]) slot[name=icon] slot:not([name=high]) {
        display: none !important;
      }

      :host([${h.MEDIA_VOLUME_LEVEL}=off]) slot[name=icon] slot:not([name=off]) {
        display: none !important;
      }

      :host([${h.MEDIA_VOLUME_LEVEL}=low]) slot[name=icon] slot:not([name=low]) {
        display: none !important;
      }

      :host([${h.MEDIA_VOLUME_LEVEL}=medium]) slot[name=icon] slot:not([name=medium]) {
        display: none !important;
      }

      :host(:not([${h.MEDIA_VOLUME_LEVEL}=off])) slot[name=tooltip-unmute],
      :host([${h.MEDIA_VOLUME_LEVEL}=off]) slot[name=tooltip-mute] {
        display: none;
      }
    </style>

    <slot name="icon">
      <slot name="off">${rT}</slot>
      <slot name="low">${Tv}</slot>
      <slot name="medium">${Tv}</slot>
      <slot name="high">${nT}</slot>
    </slot>
  `}function oT(){return`
    <slot name="tooltip-mute">${D("Mute")}</slot>
    <slot name="tooltip-unmute">${D("Unmute")}</slot>
  `}const Av=e=>{const t=e.mediaVolumeLevel==="off",i=D(t?"unmute":"mute");e.setAttribute("aria-label",i)};class Wu extends Fe{static get observedAttributes(){return[...super.observedAttributes,h.MEDIA_VOLUME_LEVEL]}connectedCallback(){super.connectedCallback(),Av(this)}attributeChangedCallback(t,i,a){super.attributeChangedCallback(t,i,a),t===h.MEDIA_VOLUME_LEVEL&&Av(this)}get mediaVolumeLevel(){return _e(this,h.MEDIA_VOLUME_LEVEL)}set mediaVolumeLevel(t){me(this,h.MEDIA_VOLUME_LEVEL,t)}handleClick(){const t=this.mediaVolumeLevel==="off"?x.MEDIA_UNMUTE_REQUEST:x.MEDIA_MUTE_REQUEST;this.dispatchEvent(new b.CustomEvent(t,{composed:!0,bubbles:!0}))}}Wu.getSlotTemplateHTML=sT,Wu.getTooltipContentHTML=oT,b.customElements.get("media-mute-button")||b.customElements.define("media-mute-button",Wu);var nS=null;const kv=`<svg aria-hidden="true" viewBox="0 0 28 24">
  <path d="M24 3H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h20a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1Zm-1 16H5V5h18v14Zm-3-8h-7v5h7v-5Z"/>
</svg>`;function lT(e){return`
    <style>
      :host([${h.MEDIA_IS_PIP}]) slot[name=icon] slot:not([name=exit]) {
        display: none !important;
      }

      :host(:not([${h.MEDIA_IS_PIP}])) slot[name=icon] slot:not([name=enter]) {
        display: none !important;
      }

      :host([${h.MEDIA_IS_PIP}]) slot[name=tooltip-enter],
      :host(:not([${h.MEDIA_IS_PIP}])) slot[name=tooltip-exit] {
        display: none;
      }
    </style>

    <slot name="icon">
      <slot name="enter">${kv}</slot>
      <slot name="exit">${kv}</slot>
    </slot>
  `}function dT(){return`
    <slot name="tooltip-enter">${D("Enter picture in picture mode")}</slot>
    <slot name="tooltip-exit">${D("Exit picture in picture mode")}</slot>
  `}const wv=e=>{const t=e.mediaIsPip?D("exit picture in picture mode"):D("enter picture in picture mode");e.setAttribute("aria-label",t)};class Fu extends Fe{static get observedAttributes(){return[...super.observedAttributes,h.MEDIA_IS_PIP,h.MEDIA_PIP_UNAVAILABLE]}connectedCallback(){super.connectedCallback(),wv(this)}attributeChangedCallback(t,i,a){super.attributeChangedCallback(t,i,a),t===h.MEDIA_IS_PIP&&wv(this)}get mediaPipUnavailable(){return _e(this,h.MEDIA_PIP_UNAVAILABLE)}set mediaPipUnavailable(t){me(this,h.MEDIA_PIP_UNAVAILABLE,t)}get mediaIsPip(){return j(this,h.MEDIA_IS_PIP)}set mediaIsPip(t){X(this,h.MEDIA_IS_PIP,t)}handleClick(){const t=this.mediaIsPip?x.MEDIA_EXIT_PIP_REQUEST:x.MEDIA_ENTER_PIP_REQUEST;this.dispatchEvent(new b.CustomEvent(t,{composed:!0,bubbles:!0}))}}Fu.getSlotTemplateHTML=lT,Fu.getTooltipContentHTML=dT,b.customElements.get("media-pip-button")||b.customElements.define("media-pip-button",Fu);var sS=null,uT=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},ur=(e,t,i)=>(uT(e,t,"read from private field"),i?i.call(e):t.get(e)),cT=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},Qi;const Ku={RATES:"rates"},Sv=[1,1.2,1.5,1.7,2],Mn=1;function Zi(e){return Math.round(e*100)/100}function hT(e){return`
    <style>
      :host {
        min-width: 5ch;
        padding: var(--media-button-padding, var(--media-control-padding, 10px 5px));
      }
    </style>
    <slot name="icon">${e.mediaplaybackrate?Zi(+e.mediaplaybackrate):Mn}x</slot>
  `}function mT(){return D("Playback rate")}class $u extends Fe{constructor(){var t;super(),cT(this,Qi,new nu(this,Ku.RATES,{defaultValue:Sv})),this.container=this.shadowRoot.querySelector('slot[name="icon"]'),this.container.innerHTML=`${Zi((t=this.mediaPlaybackRate)!=null?t:Mn)}x`}static get observedAttributes(){return[...super.observedAttributes,h.MEDIA_PLAYBACK_RATE,Ku.RATES]}attributeChangedCallback(t,i,a){if(super.attributeChangedCallback(t,i,a),t===Ku.RATES&&(ur(this,Qi).value=a),t===h.MEDIA_PLAYBACK_RATE){const r=a?+a:Number.NaN,n=Zi(Number.isNaN(r)?Mn:r);this.container.innerHTML=`${n}x`,this.setAttribute("aria-label",D("Playback rate {playbackRate}",{playbackRate:n}))}}get rates(){return ur(this,Qi)}set rates(t){t?Array.isArray(t)?ur(this,Qi).value=t.join(" "):typeof t=="string"&&(ur(this,Qi).value=t):ur(this,Qi).value=""}get mediaPlaybackRate(){return ce(this,h.MEDIA_PLAYBACK_RATE,Mn)}set mediaPlaybackRate(t){ge(this,h.MEDIA_PLAYBACK_RATE,t)}handleClick(){var t,i;const a=Array.from(ur(this,Qi).values(),s=>+s).sort((s,o)=>s-o),r=(i=(t=a.find(s=>s>this.mediaPlaybackRate))!=null?t:a[0])!=null?i:Mn,n=new b.CustomEvent(x.MEDIA_PLAYBACK_RATE_REQUEST,{composed:!0,bubbles:!0,detail:r});this.dispatchEvent(n)}}Qi=new WeakMap,$u.getSlotTemplateHTML=hT,$u.getTooltipContentHTML=mT,b.customElements.get("media-playback-rate-button")||b.customElements.define("media-playback-rate-button",$u);var oS=null;const pT=`<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="m6 21 15-9L6 3v18Z"/>
</svg>`,vT=`<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="M6 20h4V4H6v16Zm8-16v16h4V4h-4Z"/>
</svg>`;function _T(e){return`
    <style>
      :host([${h.MEDIA_PAUSED}]) slot[name=pause],
      :host(:not([${h.MEDIA_PAUSED}])) slot[name=play] {
        display: none !important;
      }

      :host([${h.MEDIA_PAUSED}]) slot[name=tooltip-pause],
      :host(:not([${h.MEDIA_PAUSED}])) slot[name=tooltip-play] {
        display: none;
      }
    </style>

    <slot name="icon">
      <slot name="play">${pT}</slot>
      <slot name="pause">${vT}</slot>
    </slot>
  `}function fT(){return`
    <slot name="tooltip-play">${D("Play")}</slot>
    <slot name="tooltip-pause">${D("Pause")}</slot>
  `}const Iv=e=>{const t=e.mediaPaused?D("play"):D("pause");e.setAttribute("aria-label",t)};class Vu extends Fe{static get observedAttributes(){return[...super.observedAttributes,h.MEDIA_PAUSED,h.MEDIA_ENDED]}connectedCallback(){super.connectedCallback(),Iv(this)}attributeChangedCallback(t,i,a){super.attributeChangedCallback(t,i,a),(t===h.MEDIA_PAUSED||t===h.MEDIA_LANG)&&Iv(this)}get mediaPaused(){return j(this,h.MEDIA_PAUSED)}set mediaPaused(t){X(this,h.MEDIA_PAUSED,t)}handleClick(){const t=this.mediaPaused?x.MEDIA_PLAY_REQUEST:x.MEDIA_PAUSE_REQUEST;this.dispatchEvent(new b.CustomEvent(t,{composed:!0,bubbles:!0}))}}Vu.getSlotTemplateHTML=_T,Vu.getTooltipContentHTML=fT,b.customElements.get("media-play-button")||b.customElements.define("media-play-button",Vu);var lS=null;const ai={PLACEHOLDER_SRC:"placeholdersrc",SRC:"src"};function ET(e){return`
    <style>
      :host {
        pointer-events: none;
        display: var(--media-poster-image-display, inline-block);
        box-sizing: border-box;
      }

      img {
        max-width: 100%;
        max-height: 100%;
        min-width: 100%;
        min-height: 100%;
        background-repeat: no-repeat;
        background-position: var(--media-poster-image-background-position, var(--media-object-position, center));
        background-size: var(--media-poster-image-background-size, var(--media-object-fit, contain));
        object-fit: var(--media-object-fit, contain);
        object-position: var(--media-object-position, center);
      }
    </style>

    <img part="poster img" aria-hidden="true" id="image"/>
  `}const bT=e=>{e.style.removeProperty("background-image")},gT=(e,t)=>{e.style["background-image"]=`url('${t}')`};class qu extends b.HTMLElement{static get observedAttributes(){return[ai.PLACEHOLDER_SRC,ai.SRC]}constructor(){if(super(),!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);const t=ut(this.attributes);this.shadowRoot.innerHTML=this.constructor.getTemplateHTML(t)}this.image=this.shadowRoot.querySelector("#image")}attributeChangedCallback(t,i,a){t===ai.SRC&&(a==null?this.image.removeAttribute(ai.SRC):this.image.setAttribute(ai.SRC,a)),t===ai.PLACEHOLDER_SRC&&(a==null?bT(this.image):gT(this.image,a))}get placeholderSrc(){return _e(this,ai.PLACEHOLDER_SRC)}set placeholderSrc(t){me(this,ai.SRC,t)}get src(){return _e(this,ai.SRC)}set src(t){me(this,ai.SRC,t)}}qu.shadowRootOptions={mode:"open"},qu.getTemplateHTML=ET,b.customElements.get("media-poster-image")||b.customElements.define("media-poster-image",qu);var dS=null,Rv=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},yT=(e,t,i)=>(Rv(e,t,"read from private field"),i?i.call(e):t.get(e)),TT=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},AT=(e,t,i,a)=>(Rv(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),Oo;class kT extends Gi{constructor(){super(),TT(this,Oo,void 0),AT(this,Oo,this.shadowRoot.querySelector("slot"))}static get observedAttributes(){return[...super.observedAttributes,h.MEDIA_PREVIEW_CHAPTER,h.MEDIA_LANG]}attributeChangedCallback(t,i,a){if(super.attributeChangedCallback(t,i,a),(t===h.MEDIA_PREVIEW_CHAPTER||t===h.MEDIA_LANG)&&a!==i&&a!=null)if(yT(this,Oo).textContent=a,a!==""){const r=D("chapter: {chapterName}",{chapterName:a});this.setAttribute("aria-valuetext",r)}else this.removeAttribute("aria-valuetext")}get mediaPreviewChapter(){return _e(this,h.MEDIA_PREVIEW_CHAPTER)}set mediaPreviewChapter(t){me(this,h.MEDIA_PREVIEW_CHAPTER,t)}}Oo=new WeakMap,b.customElements.get("media-preview-chapter-display")||b.customElements.define("media-preview-chapter-display",kT);var uS=null,Lv=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},No=(e,t,i)=>(Lv(e,t,"read from private field"),i?i.call(e):t.get(e)),wT=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},Po=(e,t,i,a)=>(Lv(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),ri;function ST(e){return`
    <style>
      :host {
        box-sizing: border-box;
        display: var(--media-control-display, var(--media-preview-thumbnail-display, inline-block));
        overflow: hidden;
      }

      img {
        display: none;
        position: relative;
      }
    </style>
    <img crossorigin loading="eager" decoding="async">
  `}class Uo extends b.HTMLElement{constructor(){if(super(),wT(this,ri,void 0),!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);const t=ut(this.attributes);this.shadowRoot.innerHTML=this.constructor.getTemplateHTML(t)}}static get observedAttributes(){return[ae.MEDIA_CONTROLLER,h.MEDIA_PREVIEW_IMAGE,h.MEDIA_PREVIEW_COORDS]}connectedCallback(){var t,i,a;const r=this.getAttribute(ae.MEDIA_CONTROLLER);r&&(Po(this,ri,(t=this.getRootNode())==null?void 0:t.getElementById(r)),(a=(i=No(this,ri))==null?void 0:i.associateElement)==null||a.call(i,this))}disconnectedCallback(){var t,i;(i=(t=No(this,ri))==null?void 0:t.unassociateElement)==null||i.call(t,this),Po(this,ri,null)}attributeChangedCallback(t,i,a){var r,n,s,o,l;[h.MEDIA_PREVIEW_IMAGE,h.MEDIA_PREVIEW_COORDS].includes(t)&&this.update(),t===ae.MEDIA_CONTROLLER&&(i&&((n=(r=No(this,ri))==null?void 0:r.unassociateElement)==null||n.call(r,this),Po(this,ri,null)),a&&this.isConnected&&(Po(this,ri,(s=this.getRootNode())==null?void 0:s.getElementById(a)),(l=(o=No(this,ri))==null?void 0:o.associateElement)==null||l.call(o,this)))}get mediaPreviewImage(){return _e(this,h.MEDIA_PREVIEW_IMAGE)}set mediaPreviewImage(t){me(this,h.MEDIA_PREVIEW_IMAGE,t)}get mediaPreviewCoords(){const t=this.getAttribute(h.MEDIA_PREVIEW_COORDS);if(t)return t.split(/\s+/).map(i=>+i)}set mediaPreviewCoords(t){if(!t){this.removeAttribute(h.MEDIA_PREVIEW_COORDS);return}this.setAttribute(h.MEDIA_PREVIEW_COORDS,t.join(" "))}update(){const t=this.mediaPreviewCoords,i=this.mediaPreviewImage;if(!(t&&i))return;const[a,r,n,s]=t,o=i.split("#")[0],l=getComputedStyle(this),{maxWidth:c,maxHeight:p,minWidth:v,minHeight:d}=l,u=l.getPropertyValue("--media-preview-thumbnail-object-fit").trim()||"contain";let m,_;if(u==="fill"){const I=parseInt(c)/n,S=parseInt(p)/s,H=parseInt(v)/n,G=parseInt(d)/s;m=I<1?I:Math.max(I,H),_=S<1?S:Math.max(S,G)}else{const I=Math.min(parseInt(c)/n,parseInt(p)/s),S=Math.max(parseInt(v)/n,parseInt(d)/s),G=I<1?I:S>1?S:1;m=G,_=G}const{style:y}=Pe(this.shadowRoot,":host"),g=Pe(this.shadowRoot,"img").style,A=this.shadowRoot.querySelector("img"),T=Math.min(m,_)<1?"min":"max";y.setProperty(`${T}-width`,"initial","important"),y.setProperty(`${T}-height`,"initial","important"),y.width=`${n*m}px`,y.height=`${s*_}px`;const L=()=>{g.width=`${this.imgWidth*m}px`,g.height=`${this.imgHeight*_}px`,g.display="block"};A.src!==o&&(A.onload=()=>{this.imgWidth=A.naturalWidth,this.imgHeight=A.naturalHeight,L(),A.onload=null},A.src=o,L()),L(),g.transform=`translate(-${a*m}px, -${r*_}px)`}}ri=new WeakMap,Uo.shadowRootOptions={mode:"open"},Uo.getTemplateHTML=ST,b.customElements.get("media-preview-thumbnail")||b.customElements.define("media-preview-thumbnail",Uo);var Cv=Uo,Mv=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},Dv=(e,t,i)=>(Mv(e,t,"read from private field"),i?i.call(e):t.get(e)),IT=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},RT=(e,t,i,a)=>(Mv(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),Dn;class LT extends Gi{constructor(){super(),IT(this,Dn,void 0),RT(this,Dn,this.shadowRoot.querySelector("slot")),Dv(this,Dn).textContent=Fi(0)}static get observedAttributes(){return[...super.observedAttributes,h.MEDIA_PREVIEW_TIME]}attributeChangedCallback(t,i,a){super.attributeChangedCallback(t,i,a),t===h.MEDIA_PREVIEW_TIME&&a!=null&&(Dv(this,Dn).textContent=Fi(parseFloat(a)))}get mediaPreviewTime(){return ce(this,h.MEDIA_PREVIEW_TIME)}set mediaPreviewTime(t){ge(this,h.MEDIA_PREVIEW_TIME,t)}}Dn=new WeakMap,b.customElements.get("media-preview-time-display")||b.customElements.define("media-preview-time-display",LT);var cS=null;const cr={SEEK_OFFSET:"seekoffset"},Yu=30,CT=e=>`
  <svg aria-hidden="true" viewBox="0 0 20 24">
    <defs>
      <style>.text{font-size:8px;font-family:Arial-BoldMT, Arial;font-weight:700;}</style>
    </defs>
    <text class="text value" transform="translate(2.18 19.87)">${e}</text>
    <path d="M10 6V3L4.37 7 10 10.94V8a5.54 5.54 0 0 1 1.9 10.48v2.12A7.5 7.5 0 0 0 10 6Z"/>
  </svg>`;function MT(e,t){return`
    <slot name="icon">${CT(t.seekOffset)}</slot>
  `}const DT=(e,t)=>{e.setAttribute("aria-label",D("seek back {seekOffset} seconds",{seekOffset:t}))};function xT(){return D("Seek backward")}const OT=0;class Gu extends Fe{static get observedAttributes(){return[...super.observedAttributes,h.MEDIA_CURRENT_TIME,cr.SEEK_OFFSET]}connectedCallback(){super.connectedCallback(),this.seekOffset=ce(this,cr.SEEK_OFFSET,Yu)}attributeChangedCallback(t,i,a){super.attributeChangedCallback(t,i,a),DT(this,this.seekOffset),t===cr.SEEK_OFFSET&&(this.seekOffset=ce(this,cr.SEEK_OFFSET,Yu))}get seekOffset(){return ce(this,cr.SEEK_OFFSET,Yu)}set seekOffset(t){ge(this,cr.SEEK_OFFSET,t),this.setAttribute("aria-label",D("seek back {seekOffset} seconds",{seekOffset:this.seekOffset})),hp(mp(this,"icon"),this.seekOffset)}get mediaCurrentTime(){return ce(this,h.MEDIA_CURRENT_TIME,OT)}set mediaCurrentTime(t){ge(this,h.MEDIA_CURRENT_TIME,t)}handleClick(){const t=Math.max(this.mediaCurrentTime-this.seekOffset,0),i=new b.CustomEvent(x.MEDIA_SEEK_REQUEST,{composed:!0,bubbles:!0,detail:t});this.dispatchEvent(i)}}Gu.getSlotTemplateHTML=MT,Gu.getTooltipContentHTML=xT,b.customElements.get("media-seek-backward-button")||b.customElements.define("media-seek-backward-button",Gu);var hS=null;const hr={SEEK_OFFSET:"seekoffset"},zu=30,NT=e=>`
  <svg aria-hidden="true" viewBox="0 0 20 24">
    <defs>
      <style>.text{font-size:8px;font-family:Arial-BoldMT, Arial;font-weight:700;}</style>
    </defs>
    <text class="text value" transform="translate(8.9 19.87)">${e}</text>
    <path d="M10 6V3l5.61 4L10 10.94V8a5.54 5.54 0 0 0-1.9 10.48v2.12A7.5 7.5 0 0 1 10 6Z"/>
  </svg>`;function PT(e,t){return`
    <slot name="icon">${NT(t.seekOffset)}</slot>
  `}const UT=(e,t)=>{e.setAttribute("aria-label",D("seek forward {seekOffset} seconds",{seekOffset:t}))};function BT(){return D("Seek forward")}const HT=0;class Qu extends Fe{static get observedAttributes(){return[...super.observedAttributes,h.MEDIA_CURRENT_TIME,hr.SEEK_OFFSET]}connectedCallback(){super.connectedCallback(),this.seekOffset=ce(this,hr.SEEK_OFFSET,zu)}attributeChangedCallback(t,i,a){super.attributeChangedCallback(t,i,a),UT(this,this.seekOffset),t===hr.SEEK_OFFSET&&(this.seekOffset=ce(this,hr.SEEK_OFFSET,zu))}get seekOffset(){return ce(this,hr.SEEK_OFFSET,zu)}set seekOffset(t){ge(this,hr.SEEK_OFFSET,t),this.setAttribute("aria-label",D("seek forward {seekOffset} seconds",{seekOffset:this.seekOffset})),hp(mp(this,"icon"),this.seekOffset)}get mediaCurrentTime(){return ce(this,h.MEDIA_CURRENT_TIME,HT)}set mediaCurrentTime(t){ge(this,h.MEDIA_CURRENT_TIME,t)}handleClick(){const t=this.mediaCurrentTime+this.seekOffset,i=new b.CustomEvent(x.MEDIA_SEEK_REQUEST,{composed:!0,bubbles:!0,detail:t});this.dispatchEvent(i)}}Qu.getSlotTemplateHTML=PT,Qu.getTooltipContentHTML=BT,b.customElements.get("media-seek-forward-button")||b.customElements.define("media-seek-forward-button",Qu);var mS=null,Zu=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},Bt=(e,t,i)=>(Zu(e,t,"read from private field"),i?i.call(e):t.get(e)),Aa=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},ju=(e,t,i,a)=>(Zu(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),ji=(e,t,i)=>(Zu(e,t,"access private method"),i),mr,ni,Bo,Xu,xv,Ho,Ju,xn,Wo,Fo,ec;const Xi={REMAINING:"remaining",SHOW_DURATION:"showduration",NO_TOGGLE:"notoggle"},Ov=[...Object.values(Xi),h.MEDIA_CURRENT_TIME,h.MEDIA_DURATION,h.MEDIA_SEEKABLE],Nv=["Enter"," "],WT="&nbsp;/&nbsp;",tc=(e,{timesSep:t=WT}={})=>{var i,a;const r=(i=e.mediaCurrentTime)!=null?i:0,[,n]=(a=e.mediaSeekable)!=null?a:[];let s=0;Number.isFinite(e.mediaDuration)?s=e.mediaDuration:Number.isFinite(n)&&(s=n);const o=e.remaining?Fi(0-(s-r)):Fi(r);return e.showDuration?`${o}${t}${Fi(s)}`:o},FT=e=>{var t;const i=e.mediaCurrentTime,[,a]=(t=e.mediaSeekable)!=null?t:[];let r=null;if(Number.isFinite(e.mediaDuration)?r=e.mediaDuration:Number.isFinite(a)&&(r=a),i==null||r===null){e.setAttribute("aria-description",D("video not loaded, unknown time."));return}const n=e.remaining?cn(0-(r-i)):cn(i);if(!e.showDuration){e.setAttribute("aria-description",n);return}const s=cn(r),o=D("{currentTime} of {totalTime}",{currentTime:n,totalTime:s});e.setAttribute("aria-description",o)};function KT(e,t){return`
    <slot>${tc(t)}</slot>
  `}const $T=e=>{e.setAttribute("aria-label",D("playback time"))};class Pv extends Gi{constructor(){super(),Aa(this,Xu),Aa(this,Ho),Aa(this,xn),Aa(this,Fo),Aa(this,mr,void 0),Aa(this,ni,null),Aa(this,Bo,t=>{const{metaKey:i,altKey:a,key:r}=t;if(i||a||!Nv.includes(r)){this.removeEventListener("keyup",Bt(this,ni));return}this.addEventListener("keyup",Bt(this,ni))}),ju(this,mr,this.shadowRoot.querySelector("slot")),Bt(this,mr).innerHTML=`${tc(this)}`}static get observedAttributes(){return[...super.observedAttributes,...Ov,"disabled"]}connectedCallback(){const{style:t}=Pe(this.shadowRoot,":host(:hover:not([notoggle]))");t.setProperty("cursor","var(--media-cursor, pointer)"),t.setProperty("background","var(--media-control-hover-background, rgba(50 50 70 / .7))"),this.setAttribute("aria-label",D("playback time")),ji(this,xn,Wo).call(this),super.connectedCallback()}toggleTimeDisplay(){this.noToggle||(this.hasAttribute("remaining")?this.removeAttribute("remaining"):this.setAttribute("remaining",""))}disconnectedCallback(){this.disable(),ji(this,Ho,Ju).call(this),super.disconnectedCallback()}attributeChangedCallback(t,i,a){$T(this),Ov.includes(t)?this.update():t==="disabled"&&a!==i?a==null?ji(this,xn,Wo).call(this):ji(this,Fo,ec).call(this):t===Xi.NO_TOGGLE&&a!==i&&(this.noToggle?ji(this,Fo,ec).call(this):ji(this,xn,Wo).call(this)),super.attributeChangedCallback(t,i,a)}enable(){this.noToggle||(this.tabIndex=0)}disable(){this.tabIndex=-1}get remaining(){return j(this,Xi.REMAINING)}set remaining(t){X(this,Xi.REMAINING,t)}get showDuration(){return j(this,Xi.SHOW_DURATION)}set showDuration(t){X(this,Xi.SHOW_DURATION,t)}get noToggle(){return j(this,Xi.NO_TOGGLE)}set noToggle(t){X(this,Xi.NO_TOGGLE,t)}get mediaDuration(){return ce(this,h.MEDIA_DURATION)}set mediaDuration(t){ge(this,h.MEDIA_DURATION,t)}get mediaCurrentTime(){return ce(this,h.MEDIA_CURRENT_TIME)}set mediaCurrentTime(t){ge(this,h.MEDIA_CURRENT_TIME,t)}get mediaSeekable(){const t=this.getAttribute(h.MEDIA_SEEKABLE);if(t)return t.split(":").map(i=>+i)}set mediaSeekable(t){if(t==null){this.removeAttribute(h.MEDIA_SEEKABLE);return}this.setAttribute(h.MEDIA_SEEKABLE,t.join(":"))}update(){const t=tc(this);FT(this),t!==Bt(this,mr).innerHTML&&(Bt(this,mr).innerHTML=t)}}mr=new WeakMap,ni=new WeakMap,Bo=new WeakMap,Xu=new WeakSet,xv=function(){Bt(this,ni)||(ju(this,ni,e=>{const{key:t}=e;if(!Nv.includes(t)){this.removeEventListener("keyup",Bt(this,ni));return}this.toggleTimeDisplay()}),this.addEventListener("keydown",Bt(this,Bo)),this.addEventListener("click",this.toggleTimeDisplay))},Ho=new WeakSet,Ju=function(){Bt(this,ni)&&(this.removeEventListener("keyup",Bt(this,ni)),this.removeEventListener("keydown",Bt(this,Bo)),this.removeEventListener("click",this.toggleTimeDisplay),ju(this,ni,null))},xn=new WeakSet,Wo=function(){!this.noToggle&&!this.hasAttribute("disabled")&&(this.setAttribute("role","button"),this.enable(),ji(this,Xu,xv).call(this))},Fo=new WeakSet,ec=function(){this.removeAttribute("role"),this.disable(),ji(this,Ho,Ju).call(this)},Pv.getSlotTemplateHTML=KT,b.customElements.get("media-time-display")||b.customElements.define("media-time-display",Pv);var pS=null,Uv=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},Ke=(e,t,i)=>(Uv(e,t,"read from private field"),i?i.call(e):t.get(e)),si=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},ct=(e,t,i,a)=>(Uv(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),VT=(e,t,i,a)=>({set _(r){ct(e,t,r,i)},get _(){return Ke(e,t,a)}}),pr,Ko,vr,On,$o,Vo,qo,_r,ka,Yo;class qT{constructor(t,i,a){si(this,pr,void 0),si(this,Ko,void 0),si(this,vr,void 0),si(this,On,void 0),si(this,$o,void 0),si(this,Vo,void 0),si(this,qo,void 0),si(this,_r,void 0),si(this,ka,0),si(this,Yo,(r=performance.now())=>{ct(this,ka,requestAnimationFrame(Ke(this,Yo))),ct(this,On,performance.now()-Ke(this,vr));const n=1e3/this.fps;if(Ke(this,On)>n){ct(this,vr,r-Ke(this,On)%n);const s=1e3/((r-Ke(this,Ko))/++VT(this,$o)._),o=(r-Ke(this,Vo))/1e3/this.duration;let l=Ke(this,qo)+o*this.playbackRate;l-Ke(this,pr).valueAsNumber>0?ct(this,_r,this.playbackRate/this.duration/s):(ct(this,_r,.995*Ke(this,_r)),l=Ke(this,pr).valueAsNumber+Ke(this,_r)),this.callback(l)}}),ct(this,pr,t),this.callback=i,this.fps=a}start(){Ke(this,ka)===0&&(ct(this,vr,performance.now()),ct(this,Ko,Ke(this,vr)),ct(this,$o,0),Ke(this,Yo).call(this))}stop(){Ke(this,ka)!==0&&(cancelAnimationFrame(Ke(this,ka)),ct(this,ka,0))}update({start:t,duration:i,playbackRate:a}){const r=t-Ke(this,pr).valueAsNumber,n=Math.abs(i-this.duration);(r>0||r<-.03||n>=.5)&&this.callback(t),ct(this,qo,t),ct(this,Vo,performance.now()),this.duration=i,this.playbackRate=a}}pr=new WeakMap,Ko=new WeakMap,vr=new WeakMap,On=new WeakMap,$o=new WeakMap,Vo=new WeakMap,qo=new WeakMap,_r=new WeakMap,ka=new WeakMap,Yo=new WeakMap;var ic=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},fe=(e,t,i)=>(ic(e,t,"read from private field"),i?i.call(e):t.get(e)),Ue=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},yt=(e,t,i,a)=>(ic(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),Tt=(e,t,i)=>(ic(e,t,"access private method"),i),fr,Ji,Go,Nn,zo,Qo,Pn,Un,Er,br,Bn,ac,Bv,rc,Zo,nc,jo,sc,Xo,oc,lc,Hv,Hn,Jo,dc,Wv;const YT=e=>{const t=e.range,i=cn(+Fv(e)),a=cn(+e.mediaSeekableEnd),r=i&&a?D("{currentTime} of {totalTime}",{currentTime:i,totalTime:a}):D("video not loaded, unknown time.");t.setAttribute("aria-valuetext",r)};function GT(e){return`
    <style>
      :host {
        --media-box-border-radius: 4px;
        --media-box-padding-left: 10px;
        --media-box-padding-right: 10px;
        --media-preview-border-radius: var(--media-box-border-radius);
        --media-box-arrow-offset: var(--media-box-border-radius);
        --_control-background: var(--media-control-background, var(--media-secondary-color, rgb(20 20 30 / .7)));
        --_preview-background: var(--media-preview-background, var(--_control-background));

        
        contain: layout;
      }

      #buffered {
        background: var(--media-time-range-buffered-color, rgb(255 255 255 / .4));
        position: absolute;
        height: 100%;
        will-change: width;
      }

      #preview-rail,
      #current-rail {
        width: 100%;
        position: absolute;
        left: 0;
        bottom: 100%;
        pointer-events: none;
        will-change: transform;
      }

      [part~="box"] {
        width: min-content;
        
        position: absolute;
        bottom: 100%;
        flex-direction: column;
        align-items: center;
        transform: translateX(-50%);
      }

      [part~="current-box"] {
        display: var(--media-current-box-display, var(--media-box-display, flex));
        margin: var(--media-current-box-margin, var(--media-box-margin, 0 0 5px));
        visibility: hidden;
      }

      [part~="preview-box"] {
        display: var(--media-preview-box-display, var(--media-box-display, flex));
        margin: var(--media-preview-box-margin, var(--media-box-margin, 0 0 5px));
        transition-property: var(--media-preview-transition-property, visibility, opacity);
        transition-duration: var(--media-preview-transition-duration-out, .25s);
        transition-delay: var(--media-preview-transition-delay-out, 0s);
        visibility: hidden;
        opacity: 0;
      }

      :host(:is([${h.MEDIA_PREVIEW_IMAGE}], [${h.MEDIA_PREVIEW_TIME}])[dragging]) [part~="preview-box"] {
        transition-duration: var(--media-preview-transition-duration-in, .5s);
        transition-delay: var(--media-preview-transition-delay-in, .25s);
        visibility: visible;
        opacity: 1;
      }

      @media (hover: hover) {
        :host(:is([${h.MEDIA_PREVIEW_IMAGE}], [${h.MEDIA_PREVIEW_TIME}]):hover) [part~="preview-box"] {
          transition-duration: var(--media-preview-transition-duration-in, .5s);
          transition-delay: var(--media-preview-transition-delay-in, .25s);
          visibility: visible;
          opacity: 1;
        }
      }

      media-preview-thumbnail,
      ::slotted(media-preview-thumbnail) {
        visibility: hidden;
        
        transition: visibility 0s .25s;
        transition-delay: calc(var(--media-preview-transition-delay-out, 0s) + var(--media-preview-transition-duration-out, .25s));
        background: var(--media-preview-thumbnail-background, var(--_preview-background));
        box-shadow: var(--media-preview-thumbnail-box-shadow, 0 0 4px rgb(0 0 0 / .2));
        max-width: var(--media-preview-thumbnail-max-width, 180px);
        max-height: var(--media-preview-thumbnail-max-height, 160px);
        min-width: var(--media-preview-thumbnail-min-width, 120px);
        min-height: var(--media-preview-thumbnail-min-height, 80px);
        border: var(--media-preview-thumbnail-border);
        border-radius: var(--media-preview-thumbnail-border-radius,
          var(--media-preview-border-radius) var(--media-preview-border-radius) 0 0);
      }

      :host([${h.MEDIA_PREVIEW_IMAGE}][dragging]) media-preview-thumbnail,
      :host([${h.MEDIA_PREVIEW_IMAGE}][dragging]) ::slotted(media-preview-thumbnail) {
        transition-delay: var(--media-preview-transition-delay-in, .25s);
        visibility: visible;
      }

      @media (hover: hover) {
        :host([${h.MEDIA_PREVIEW_IMAGE}]:hover) media-preview-thumbnail,
        :host([${h.MEDIA_PREVIEW_IMAGE}]:hover) ::slotted(media-preview-thumbnail) {
          transition-delay: var(--media-preview-transition-delay-in, .25s);
          visibility: visible;
        }

        :host([${h.MEDIA_PREVIEW_TIME}]:hover) {
          --media-time-range-hover-display: block;
        }
      }

      media-preview-chapter-display,
      ::slotted(media-preview-chapter-display) {
        font-size: var(--media-font-size, 13px);
        line-height: 17px;
        min-width: 0;
        visibility: hidden;
        
        transition: min-width 0s, border-radius 0s, margin 0s, padding 0s, visibility 0s;
        transition-delay: calc(var(--media-preview-transition-delay-out, 0s) + var(--media-preview-transition-duration-out, .25s));
        background: var(--media-preview-chapter-background, var(--_preview-background));
        border-radius: var(--media-preview-chapter-border-radius,
          var(--media-preview-border-radius) var(--media-preview-border-radius)
          var(--media-preview-border-radius) var(--media-preview-border-radius));
        padding: var(--media-preview-chapter-padding, 3.5px 9px);
        margin: var(--media-preview-chapter-margin, 0 0 5px);
        text-shadow: var(--media-preview-chapter-text-shadow, 0 0 4px rgb(0 0 0 / .75));
      }

      :host([${h.MEDIA_PREVIEW_IMAGE}]) media-preview-chapter-display,
      :host([${h.MEDIA_PREVIEW_IMAGE}]) ::slotted(media-preview-chapter-display) {
        transition-delay: var(--media-preview-transition-delay-in, .25s);
        border-radius: var(--media-preview-chapter-border-radius, 0);
        padding: var(--media-preview-chapter-padding, 3.5px 9px 0);
        margin: var(--media-preview-chapter-margin, 0);
        min-width: 100%;
      }

      media-preview-chapter-display[${h.MEDIA_PREVIEW_CHAPTER}],
      ::slotted(media-preview-chapter-display[${h.MEDIA_PREVIEW_CHAPTER}]) {
        visibility: visible;
      }

      media-preview-chapter-display:not([aria-valuetext]),
      ::slotted(media-preview-chapter-display:not([aria-valuetext])) {
        display: none;
      }

      media-preview-time-display,
      ::slotted(media-preview-time-display),
      media-time-display,
      ::slotted(media-time-display) {
        font-size: var(--media-font-size, 13px);
        line-height: 17px;
        min-width: 0;
        
        transition: min-width 0s, border-radius 0s;
        transition-delay: calc(var(--media-preview-transition-delay-out, 0s) + var(--media-preview-transition-duration-out, .25s));
        background: var(--media-preview-time-background, var(--_preview-background));
        border-radius: var(--media-preview-time-border-radius,
          var(--media-preview-border-radius) var(--media-preview-border-radius)
          var(--media-preview-border-radius) var(--media-preview-border-radius));
        padding: var(--media-preview-time-padding, 3.5px 9px);
        margin: var(--media-preview-time-margin, 0);
        text-shadow: var(--media-preview-time-text-shadow, 0 0 4px rgb(0 0 0 / .75));
        transform: translateX(min(
          max(calc(50% - var(--_box-width) / 2),
          calc(var(--_box-shift, 0))),
          calc(var(--_box-width) / 2 - 50%)
        ));
      }

      :host([${h.MEDIA_PREVIEW_IMAGE}]) media-preview-time-display,
      :host([${h.MEDIA_PREVIEW_IMAGE}]) ::slotted(media-preview-time-display) {
        transition-delay: var(--media-preview-transition-delay-in, .25s);
        border-radius: var(--media-preview-time-border-radius,
          0 0 var(--media-preview-border-radius) var(--media-preview-border-radius));
        min-width: 100%;
      }

      :host([${h.MEDIA_PREVIEW_TIME}]:hover) {
        --media-time-range-hover-display: block;
      }

      [part~="arrow"],
      ::slotted([part~="arrow"]) {
        display: var(--media-box-arrow-display, inline-block);
        transform: translateX(min(
          max(calc(50% - var(--_box-width) / 2 + var(--media-box-arrow-offset)),
          calc(var(--_box-shift, 0))),
          calc(var(--_box-width) / 2 - 50% - var(--media-box-arrow-offset))
        ));
        
        border-color: transparent;
        border-top-color: var(--media-box-arrow-background, var(--_control-background));
        border-width: var(--media-box-arrow-border-width,
          var(--media-box-arrow-height, 5px) var(--media-box-arrow-width, 6px) 0);
        border-style: solid;
        justify-content: center;
        height: 0;
      }
    </style>
    <div id="preview-rail">
      <slot name="preview" part="box preview-box">
        <media-preview-thumbnail>
          <template shadowrootmode="${Cv.shadowRootOptions.mode}">
            ${Cv.getTemplateHTML({})}
          </template>
        </media-preview-thumbnail>
        <media-preview-chapter-display></media-preview-chapter-display>
        <media-preview-time-display></media-preview-time-display>
        <slot name="preview-arrow"><div part="arrow"></div></slot>
      </slot>
    </div>
    <div id="current-rail">
      <slot name="current" part="box current-box">
        
      </slot>
    </div>
  `}const el=(e,t=e.mediaCurrentTime)=>{const i=Number.isFinite(e.mediaSeekableStart)?e.mediaSeekableStart:0,a=Number.isFinite(e.mediaDuration)?e.mediaDuration:e.mediaSeekableEnd;if(Number.isNaN(a))return 0;const r=(t-i)/(a-i);return Math.max(0,Math.min(r,1))},Fv=(e,t=e.range.valueAsNumber)=>{const i=Number.isFinite(e.mediaSeekableStart)?e.mediaSeekableStart:0,a=Number.isFinite(e.mediaDuration)?e.mediaDuration:e.mediaSeekableEnd;return Number.isNaN(a)?0:t*(a-i)+i};class uc extends or{constructor(){super(),Ue(this,ac),Ue(this,Zo),Ue(this,jo),Ue(this,Xo),Ue(this,lc),Ue(this,Hn),Ue(this,dc),Ue(this,fr,null),Ue(this,Ji,void 0),Ue(this,Go,void 0),Ue(this,Nn,void 0),Ue(this,zo,void 0),Ue(this,Qo,void 0),Ue(this,Pn,void 0),Ue(this,Un,void 0),Ue(this,Er,void 0),Ue(this,br,void 0),Ue(this,Bn,()=>{Tt(this,ac,Bv).call(this)?fe(this,Ji).start():fe(this,Ji).stop()}),Ue(this,rc,a=>{this.dragging||(Qd(a)&&(this.range.valueAsNumber=a),fe(this,br)||this.updateBar())}),this.shadowRoot.querySelector("#track").insertAdjacentHTML("afterbegin",'<div id="buffered" part="buffered"></div>'),yt(this,Go,this.shadowRoot.querySelectorAll('[part~="box"]')),yt(this,zo,this.shadowRoot.querySelector('[part~="preview-box"]')),yt(this,Qo,this.shadowRoot.querySelector('[part~="current-box"]'));const i=getComputedStyle(this);yt(this,Pn,parseInt(i.getPropertyValue("--media-box-padding-left"))),yt(this,Un,parseInt(i.getPropertyValue("--media-box-padding-right"))),yt(this,Ji,new qT(this.range,fe(this,rc),60))}static get observedAttributes(){return[...super.observedAttributes,h.MEDIA_PAUSED,h.MEDIA_DURATION,h.MEDIA_SEEKABLE,h.MEDIA_CURRENT_TIME,h.MEDIA_PREVIEW_IMAGE,h.MEDIA_PREVIEW_TIME,h.MEDIA_PREVIEW_CHAPTER,h.MEDIA_BUFFERED,h.MEDIA_PLAYBACK_RATE,h.MEDIA_LOADING,h.MEDIA_ENDED]}connectedCallback(){var t;super.connectedCallback(),this.range.setAttribute("aria-label",D("seek")),fe(this,Bn).call(this),yt(this,fr,this.getRootNode()),(t=fe(this,fr))==null||t.addEventListener("transitionstart",this)}disconnectedCallback(){var t;super.disconnectedCallback(),fe(this,Ji).stop(),(t=fe(this,fr))==null||t.removeEventListener("transitionstart",this),yt(this,fr,null)}attributeChangedCallback(t,i,a){super.attributeChangedCallback(t,i,a),i!=a&&(t===h.MEDIA_CURRENT_TIME||t===h.MEDIA_PAUSED||t===h.MEDIA_ENDED||t===h.MEDIA_LOADING||t===h.MEDIA_DURATION||t===h.MEDIA_SEEKABLE?(fe(this,Ji).update({start:el(this),duration:this.mediaSeekableEnd-this.mediaSeekableStart,playbackRate:this.mediaPlaybackRate}),fe(this,Bn).call(this),YT(this)):t===h.MEDIA_BUFFERED&&this.updateBufferedBar(),(t===h.MEDIA_DURATION||t===h.MEDIA_SEEKABLE)&&(this.mediaChaptersCues=fe(this,Er),this.updateBar()))}get mediaChaptersCues(){return fe(this,Er)}set mediaChaptersCues(t){var i;yt(this,Er,t),this.updateSegments((i=fe(this,Er))==null?void 0:i.map(a=>({start:el(this,a.startTime),end:el(this,a.endTime)})))}get mediaPaused(){return j(this,h.MEDIA_PAUSED)}set mediaPaused(t){X(this,h.MEDIA_PAUSED,t)}get mediaLoading(){return j(this,h.MEDIA_LOADING)}set mediaLoading(t){X(this,h.MEDIA_LOADING,t)}get mediaDuration(){return ce(this,h.MEDIA_DURATION)}set mediaDuration(t){ge(this,h.MEDIA_DURATION,t)}get mediaCurrentTime(){return ce(this,h.MEDIA_CURRENT_TIME)}set mediaCurrentTime(t){ge(this,h.MEDIA_CURRENT_TIME,t)}get mediaPlaybackRate(){return ce(this,h.MEDIA_PLAYBACK_RATE,1)}set mediaPlaybackRate(t){ge(this,h.MEDIA_PLAYBACK_RATE,t)}get mediaBuffered(){const t=this.getAttribute(h.MEDIA_BUFFERED);return t?t.split(" ").map(i=>i.split(":").map(a=>+a)):[]}set mediaBuffered(t){if(!t){this.removeAttribute(h.MEDIA_BUFFERED);return}const i=t.map(a=>a.join(":")).join(" ");this.setAttribute(h.MEDIA_BUFFERED,i)}get mediaSeekable(){const t=this.getAttribute(h.MEDIA_SEEKABLE);if(t)return t.split(":").map(i=>+i)}set mediaSeekable(t){if(t==null){this.removeAttribute(h.MEDIA_SEEKABLE);return}this.setAttribute(h.MEDIA_SEEKABLE,t.join(":"))}get mediaSeekableEnd(){var t;const[,i=this.mediaDuration]=(t=this.mediaSeekable)!=null?t:[];return i}get mediaSeekableStart(){var t;const[i=0]=(t=this.mediaSeekable)!=null?t:[];return i}get mediaPreviewImage(){return _e(this,h.MEDIA_PREVIEW_IMAGE)}set mediaPreviewImage(t){me(this,h.MEDIA_PREVIEW_IMAGE,t)}get mediaPreviewTime(){return ce(this,h.MEDIA_PREVIEW_TIME)}set mediaPreviewTime(t){ge(this,h.MEDIA_PREVIEW_TIME,t)}get mediaEnded(){return j(this,h.MEDIA_ENDED)}set mediaEnded(t){X(this,h.MEDIA_ENDED,t)}updateBar(){super.updateBar(),this.updateBufferedBar(),this.updateCurrentBox()}updateBufferedBar(){var t;const i=this.mediaBuffered;if(!i.length)return;let a;if(this.mediaEnded)a=1;else{const n=this.mediaCurrentTime,[,s=this.mediaSeekableStart]=(t=i.find(([o,l])=>o<=n&&n<=l))!=null?t:[];a=el(this,s)}const{style:r}=Pe(this.shadowRoot,"#buffered");r.setProperty("width",`${a*100}%`)}updateCurrentBox(){if(!this.shadowRoot.querySelector('slot[name="current"]').assignedElements().length)return;const i=Pe(this.shadowRoot,"#current-rail"),a=Pe(this.shadowRoot,'[part~="current-box"]'),r=Tt(this,Zo,nc).call(this,fe(this,Qo)),n=Tt(this,jo,sc).call(this,r,this.range.valueAsNumber),s=Tt(this,Xo,oc).call(this,r,this.range.valueAsNumber);i.style.transform=`translateX(${n})`,i.style.setProperty("--_range-width",`${r.range.width}`),a.style.setProperty("--_box-shift",`${s}`),a.style.setProperty("--_box-width",`${r.box.width}px`),a.style.setProperty("visibility","initial")}handleEvent(t){switch(super.handleEvent(t),t.type){case"input":Tt(this,dc,Wv).call(this);break;case"pointermove":Tt(this,lc,Hv).call(this,t);break;case"pointerup":fe(this,br)&&yt(this,br,!1);break;case"pointerdown":yt(this,br,!0);break;case"pointerleave":Tt(this,Hn,Jo).call(this,null);break;case"transitionstart":ki(t.target,this)&&setTimeout(()=>fe(this,Bn).call(this),0);break}}}fr=new WeakMap,Ji=new WeakMap,Go=new WeakMap,Nn=new WeakMap,zo=new WeakMap,Qo=new WeakMap,Pn=new WeakMap,Un=new WeakMap,Er=new WeakMap,br=new WeakMap,Bn=new WeakMap,ac=new WeakSet,Bv=function(){return this.isConnected&&!this.mediaPaused&&!this.mediaLoading&&!this.mediaEnded&&this.mediaSeekableEnd>0&&pp(this)},rc=new WeakMap,Zo=new WeakSet,nc=function(e){var t;const a=((t=this.getAttribute("bounds")?za(this,`#${this.getAttribute("bounds")}`):this.parentElement)!=null?t:this).getBoundingClientRect(),r=this.range.getBoundingClientRect(),n=e.offsetWidth,s=-(r.left-a.left-n/2),o=a.right-r.left-n/2;return{box:{width:n,min:s,max:o},bounds:a,range:r}},jo=new WeakSet,sc=function(e,t){let i=`${t*100}%`;const{width:a,min:r,max:n}=e.box;if(!a)return i;if(Number.isNaN(r)||(i=`max(${`calc(1 / var(--_range-width) * 100 * ${r}% + var(--media-box-padding-left))`}, ${i})`),!Number.isNaN(n)){const o=`calc(1 / var(--_range-width) * 100 * ${n}% - var(--media-box-padding-right))`;i=`min(${i}, ${o})`}return i},Xo=new WeakSet,oc=function(e,t){const{width:i,min:a,max:r}=e.box,n=t*e.range.width;if(n<a+fe(this,Pn)){const s=e.range.left-e.bounds.left-fe(this,Pn);return`${n-i/2+s}px`}if(n>r-fe(this,Un)){const s=e.bounds.right-e.range.right-fe(this,Un);return`${n+i/2-s-e.range.width}px`}return 0},lc=new WeakSet,Hv=function(e){const t=[...fe(this,Go)].some(p=>e.composedPath().includes(p));if(!this.dragging&&(t||!e.composedPath().includes(this))){Tt(this,Hn,Jo).call(this,null);return}const i=this.mediaSeekableEnd;if(!i)return;const a=Pe(this.shadowRoot,"#preview-rail"),r=Pe(this.shadowRoot,'[part~="preview-box"]'),n=Tt(this,Zo,nc).call(this,fe(this,zo));let s=(e.clientX-n.range.left)/n.range.width;s=Math.max(0,Math.min(1,s));const o=Tt(this,jo,sc).call(this,n,s),l=Tt(this,Xo,oc).call(this,n,s);a.style.transform=`translateX(${o})`,a.style.setProperty("--_range-width",`${n.range.width}`),r.style.setProperty("--_box-shift",`${l}`),r.style.setProperty("--_box-width",`${n.box.width}px`);const c=Math.round(fe(this,Nn))-Math.round(s*i);Math.abs(c)<1&&s>.01&&s<.99||(yt(this,Nn,s*i),Tt(this,Hn,Jo).call(this,fe(this,Nn)))},Hn=new WeakSet,Jo=function(e){this.dispatchEvent(new b.CustomEvent(x.MEDIA_PREVIEW_REQUEST,{composed:!0,bubbles:!0,detail:e}))},dc=new WeakSet,Wv=function(){fe(this,Ji).stop();const e=Fv(this);this.dispatchEvent(new b.CustomEvent(x.MEDIA_SEEK_REQUEST,{composed:!0,bubbles:!0,detail:e}))},uc.shadowRootOptions={mode:"open"},uc.getContainerTemplateHTML=GT,b.customElements.get("media-time-range")||b.customElements.define("media-time-range",uc);var vS=null,zT=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},Kv=(e,t,i)=>(zT(e,t,"read from private field"),i?i.call(e):t.get(e)),QT=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},tl;const ZT=1,jT=e=>e.mediaMuted?0:e.mediaVolume,XT=e=>`${Math.round(e*100)}%`;class JT extends or{constructor(){super(...arguments),QT(this,tl,()=>{const t=this.range.value,i=new b.CustomEvent(x.MEDIA_VOLUME_REQUEST,{composed:!0,bubbles:!0,detail:t});this.dispatchEvent(i)})}static get observedAttributes(){return[...super.observedAttributes,h.MEDIA_VOLUME,h.MEDIA_MUTED,h.MEDIA_VOLUME_UNAVAILABLE]}connectedCallback(){super.connectedCallback(),this.range.setAttribute("aria-label",D("volume")),this.range.addEventListener("input",Kv(this,tl))}disconnectedCallback(){this.range.removeEventListener("input",Kv(this,tl)),super.disconnectedCallback()}attributeChangedCallback(t,i,a){super.attributeChangedCallback(t,i,a),(t===h.MEDIA_VOLUME||t===h.MEDIA_MUTED)&&(this.range.valueAsNumber=jT(this),this.range.setAttribute("aria-valuetext",XT(this.range.valueAsNumber)),this.updateBar())}get mediaVolume(){return ce(this,h.MEDIA_VOLUME,ZT)}set mediaVolume(t){ge(this,h.MEDIA_VOLUME,t)}get mediaMuted(){return j(this,h.MEDIA_MUTED)}set mediaMuted(t){X(this,h.MEDIA_MUTED,t)}get mediaVolumeUnavailable(){return _e(this,h.MEDIA_VOLUME_UNAVAILABLE)}set mediaVolumeUnavailable(t){me(this,h.MEDIA_VOLUME_UNAVAILABLE,t)}}tl=new WeakMap,b.customElements.get("media-volume-range")||b.customElements.define("media-volume-range",JT);var _S=null;function eA(e){return`
      <style>
        :host {
          min-width: 4ch;
          padding: var(--media-button-padding, var(--media-control-padding, 10px 5px));
          width: 100%;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 1rem;
          font-weight: var(--media-button-font-weight, normal);
        }

        #checked-indicator {
          display: none;
        }

        :host([${h.MEDIA_LOOP}]) #checked-indicator {
          display: block;
        }
      </style>
      
      <span id="icon">
     </span>

      <div id="checked-indicator">
        <svg aria-hidden="true" viewBox="0 1 24 24" part="checked-indicator indicator">
          <path d="m10 15.17 9.193-9.191 1.414 1.414-10.606 10.606-6.364-6.364 1.414-1.414 4.95 4.95Z"/>
        </svg>
      </div>
    `}function tA(){return D("Loop")}class cc extends Fe{constructor(){super(...arguments),this.container=null}static get observedAttributes(){return[...super.observedAttributes,h.MEDIA_LOOP]}connectedCallback(){var t;super.connectedCallback(),this.container=((t=this.shadowRoot)==null?void 0:t.querySelector("#icon"))||null,this.container&&(this.container.textContent=D("Loop"))}attributeChangedCallback(t,i,a){super.attributeChangedCallback(t,i,a),t===h.MEDIA_LOOP&&this.container&&this.setAttribute("aria-checked",this.mediaLoop?"true":"false")}get mediaLoop(){return j(this,h.MEDIA_LOOP)}set mediaLoop(t){X(this,h.MEDIA_LOOP,t)}handleClick(){const t=!this.mediaLoop,i=new b.CustomEvent(x.MEDIA_LOOP_REQUEST,{composed:!0,bubbles:!0,detail:t});this.dispatchEvent(i)}}cc.getSlotTemplateHTML=eA,cc.getTooltipContentHTML=tA,b.customElements.get("media-loop-button")||b.customElements.define("media-loop-button",cc);var fS=null,$v=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},Z=(e,t,i)=>($v(e,t,"read from private field"),i?i.call(e):t.get(e)),oi=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},Ri=(e,t,i,a)=>($v(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),gr,il,wa,Wn,ea,ta,ia,Sa,yr,al,Ht;const Vv=1,qv=0,iA=1,aA={processCallback(e,t,i){if(i){for(const[a,r]of t)if(a in i){const n=i[a];typeof n=="boolean"&&r instanceof Wt&&typeof r.element[r.attributeName]=="boolean"?r.booleanValue=n:typeof n=="function"&&r instanceof Wt?r.element[r.attributeName]=n:r.value=n}}}};class rl extends b.DocumentFragment{constructor(t,i,a=aA){var r;super(),oi(this,gr,void 0),oi(this,il,void 0),this.append(t.content.cloneNode(!0)),Ri(this,gr,Yv(this)),Ri(this,il,a),(r=a.createCallback)==null||r.call(a,this,Z(this,gr),i),a.processCallback(this,Z(this,gr),i)}update(t){Z(this,il).processCallback(this,Z(this,gr),t)}}gr=new WeakMap,il=new WeakMap;const Yv=(e,t=[])=>{let i,a;for(const r of e.attributes||[])if(r.value.includes("{{")){const n=new nA;for([i,a]of zv(r.value))if(!i)n.append(a);else{const s=new Wt(e,r.name,r.namespaceURI);n.append(s),t.push([a,s])}r.value=n.toString()}for(const r of e.childNodes)if(r.nodeType===Vv&&!(r instanceof HTMLTemplateElement))Yv(r,t);else{const n=r.data;if(r.nodeType===Vv||n.includes("{{")){const s=[];if(n)for([i,a]of zv(n))if(!i)s.push(new Text(a));else{const o=new Tr(e);s.push(o),t.push([a,o])}else if(r instanceof HTMLTemplateElement){const o=new jv(e,r);s.push(o),t.push([o.expression,o])}r.replaceWith(...s.flatMap(o=>o.replacementNodes||[o]))}}return t},Gv={},zv=e=>{let t="",i=0,a=Gv[e],r=0,n;if(a)return a;for(a=[];n=e[r];r++)n==="{"&&e[r+1]==="{"&&e[r-1]!=="\\"&&e[r+2]&&++i==1?(t&&a.push([qv,t]),t="",r++):n==="}"&&e[r+1]==="}"&&e[r-1]!=="\\"&&!--i?(a.push([iA,t.trim()]),t="",r++):t+=n||"";return t&&a.push([qv,(i>0?"{{":"")+t]),Gv[e]=a},rA=11;class Qv{get value(){return""}set value(t){}toString(){return this.value}}const Zv=new WeakMap;class nA{constructor(){oi(this,wa,[])}[Symbol.iterator](){return Z(this,wa).values()}get length(){return Z(this,wa).length}item(t){return Z(this,wa)[t]}append(...t){for(const i of t)i instanceof Wt&&Zv.set(i,this),Z(this,wa).push(i)}toString(){return Z(this,wa).join("")}}wa=new WeakMap;class Wt extends Qv{constructor(t,i,a){super(),oi(this,Sa),oi(this,Wn,""),oi(this,ea,void 0),oi(this,ta,void 0),oi(this,ia,void 0),Ri(this,ea,t),Ri(this,ta,i),Ri(this,ia,a)}get attributeName(){return Z(this,ta)}get attributeNamespace(){return Z(this,ia)}get element(){return Z(this,ea)}get value(){return Z(this,Wn)}set value(t){Z(this,Wn)!==t&&(Ri(this,Wn,t),!Z(this,Sa,yr)||Z(this,Sa,yr).length===1?t==null?Z(this,ea).removeAttributeNS(Z(this,ia),Z(this,ta)):Z(this,ea).setAttributeNS(Z(this,ia),Z(this,ta),t):Z(this,ea).setAttributeNS(Z(this,ia),Z(this,ta),Z(this,Sa,yr).toString()))}get booleanValue(){return Z(this,ea).hasAttributeNS(Z(this,ia),Z(this,ta))}set booleanValue(t){if(!Z(this,Sa,yr)||Z(this,Sa,yr).length===1)this.value=t?"":null;else throw new DOMException("Value is not fully templatized")}}Wn=new WeakMap,ea=new WeakMap,ta=new WeakMap,ia=new WeakMap,Sa=new WeakSet,yr=function(){return Zv.get(this)};class Tr extends Qv{constructor(t,i){super(),oi(this,al,void 0),oi(this,Ht,void 0),Ri(this,al,t),Ri(this,Ht,i?[...i]:[new Text])}get replacementNodes(){return Z(this,Ht)}get parentNode(){return Z(this,al)}get nextSibling(){return Z(this,Ht)[Z(this,Ht).length-1].nextSibling}get previousSibling(){return Z(this,Ht)[0].previousSibling}get value(){return Z(this,Ht).map(t=>t.textContent).join("")}set value(t){this.replace(t)}replace(...t){const i=t.flat().flatMap(a=>a==null?[new Text]:a.forEach?[...a]:a.nodeType===rA?[...a.childNodes]:a.nodeType?[a]:[new Text(a)]);i.length||i.push(new Text),Ri(this,Ht,sA(Z(this,Ht)[0].parentNode,Z(this,Ht),i,this.nextSibling))}}al=new WeakMap,Ht=new WeakMap;class jv extends Tr{constructor(t,i){const a=i.getAttribute("directive")||i.getAttribute("type");let r=i.getAttribute("expression")||i.getAttribute(a)||"";r.startsWith("{{")&&(r=r.trim().slice(2,-2).trim()),super(t),this.expression=r,this.template=i,this.directive=a}}function sA(e,t,i,a=null){let r=0,n,s,o,l=i.length,c=t.length;for(;r<l&&r<c&&t[r]==i[r];)r++;for(;r<l&&r<c&&i[l-1]==t[c-1];)a=i[--c,--l];if(r==c)for(;r<l;)e.insertBefore(i[r++],a);if(r==l)for(;r<c;)e.removeChild(t[r++]);else{for(n=t[r];r<l;)o=i[r++],s=n?n.nextSibling:a,n==o?n=s:r<l&&i[r]==s?(e.replaceChild(o,n),n=s):e.insertBefore(o,n);for(;n!=a;)s=n.nextSibling,e.removeChild(n),n=s}return i}const Xv={string:e=>String(e)};class Jv{constructor(t){this.template=t,this.state=void 0}}const Ia=new WeakMap,Ra=new WeakMap,hc={partial:(e,t)=>{t[e.expression]=new Jv(e.template)},if:(e,t)=>{var i;if(t_(e.expression,t))if(Ia.get(e)!==e.template){Ia.set(e,e.template);const a=new rl(e.template,t,mc);e.replace(a),Ra.set(e,a)}else(i=Ra.get(e))==null||i.update(t);else e.replace(""),Ia.delete(e),Ra.delete(e)}},oA=Object.keys(hc),mc={processCallback(e,t,i){var a,r;if(i)for(const[n,s]of t){if(s instanceof jv){if(!s.directive){const l=oA.find(c=>s.template.hasAttribute(c));l&&(s.directive=l,s.expression=s.template.getAttribute(l))}(a=hc[s.directive])==null||a.call(hc,s,i);continue}let o=t_(n,i);if(o instanceof Jv){Ia.get(s)!==o.template?(Ia.set(s,o.template),o=new rl(o.template,o.state,mc),s.value=o,Ra.set(s,o)):(r=Ra.get(s))==null||r.update(o.state);continue}o?(s instanceof Wt&&s.attributeName.startsWith("aria-")&&(o=String(o)),s instanceof Wt?typeof o=="boolean"?s.booleanValue=o:typeof o=="function"?s.element[s.attributeName]=o:s.value=o:(s.value=o,Ia.delete(s),Ra.delete(s))):s instanceof Wt?s.value=void 0:(s.value=void 0,Ia.delete(s),Ra.delete(s))}}},e_={"!":e=>!e,"!!":e=>!!e,"==":(e,t)=>e==t,"!=":(e,t)=>e!=t,">":(e,t)=>e>t,">=":(e,t)=>e>=t,"<":(e,t)=>e<t,"<=":(e,t)=>e<=t,"??":(e,t)=>e!=null?e:t,"|":(e,t)=>{var i;return(i=Xv[t])==null?void 0:i.call(Xv,e)}};function lA(e){return dA(e,{boolean:/true|false/,number:/-?\d+\.?\d*/,string:/(["'])((?:\\.|[^\\])*?)\1/,operator:/[!=><][=!]?|\?\?|\|/,ws:/\s+/,param:/[$a-z_][$\w]*/i}).filter(({type:t})=>t!=="ws")}function t_(e,t={}){var i,a,r,n,s,o,l;const c=lA(e);if(c.length===0||c.some(({type:p})=>!p))return Fn(e);if(((i=c[0])==null?void 0:i.token)===">"){const p=t[(a=c[1])==null?void 0:a.token];if(!p)return Fn(e);const v=U({},t);p.state=v;const d=c.slice(2);for(let u=0;u<d.length;u+=3){const m=(r=d[u])==null?void 0:r.token,_=(n=d[u+1])==null?void 0:n.token,y=(s=d[u+2])==null?void 0:s.token;m&&_==="="&&(v[m]=Kn(y,t))}return p}if(c.length===1)return nl(c[0])?Kn(c[0].token,t):Fn(e);if(c.length===2){const p=(o=c[0])==null?void 0:o.token,v=e_[p];if(!v||!nl(c[1]))return Fn(e);const d=Kn(c[1].token,t);return v(d)}if(c.length===3){const p=(l=c[1])==null?void 0:l.token,v=e_[p];if(!v||!nl(c[0])||!nl(c[2]))return Fn(e);const d=Kn(c[0].token,t);if(p==="|")return v(d,c[2].token);const u=Kn(c[2].token,t);return v(d,u)}}function Fn(e){return console.warn(`Warning: invalid expression \`${e}\``),!1}function nl({type:e}){return["number","boolean","string","param"].includes(e)}function Kn(e,t){const i=e[0],a=e.slice(-1);return e==="true"||e==="false"?e==="true":i===a&&["'",'"'].includes(i)?e.slice(1,-1):ep(e)?parseFloat(e):t[e]}function dA(e,t){let i,a,r;const n=[];for(;e;){r=null,i=e.length;for(const s in t)a=t[s].exec(e),a&&a.index<i&&(r={token:a[0],type:s,matches:a.slice(1)},i=a.index);i&&n.push({token:e.substr(0,i),type:void 0}),r&&n.push(r),e=e.substr(i+(r?r.token.length:0))}return n}var pc=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},aa=(e,t,i)=>(pc(e,t,"read from private field"),i?i.call(e):t.get(e)),La=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},Li=(e,t,i,a)=>(pc(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),vc=(e,t,i)=>(pc(e,t,"access private method"),i),Ar,sl,kr,wr,_c,i_,ol,fc,$n;const Ec={mediatargetlivewindow:"targetlivewindow",mediastreamtype:"streamtype"},a_=Le.createElement("template");a_.innerHTML=`
  <style>
    :host {
      display: inline-block;
      line-height: 0;
    }

    media-controller {
      width: 100%;
      height: 100%;
    }

    media-captions-button:not([mediasubtitleslist]),
    media-captions-menu:not([mediasubtitleslist]),
    media-captions-menu-button:not([mediasubtitleslist]),
    media-audio-track-menu[mediaaudiotrackunavailable],
    media-audio-track-menu-button[mediaaudiotrackunavailable],
    media-rendition-menu[mediarenditionunavailable],
    media-rendition-menu-button[mediarenditionunavailable],
    media-volume-range[mediavolumeunavailable],
    media-airplay-button[mediaairplayunavailable],
    media-fullscreen-button[mediafullscreenunavailable],
    media-cast-button[mediacastunavailable],
    media-pip-button[mediapipunavailable] {
      display: none;
    }
  </style>
`;class ll extends b.HTMLElement{constructor(){super(),La(this,_c),La(this,ol),La(this,Ar,void 0),La(this,sl,void 0),La(this,kr,void 0),La(this,wr,void 0),La(this,$n,void 0),this.shadowRoot?this.renderRoot=this.shadowRoot:(this.renderRoot=this.attachShadow({mode:"open"}),this.createRenderer()),Li(this,wr,new MutationObserver(t=>{var i;this.mediaController&&!((i=this.mediaController)!=null&&i.breakpointsComputed)||t.some(a=>{const r=a.target;return r===this?!0:r.localName!=="media-controller"?!1:!!(Ec[a.attributeName]||a.attributeName.startsWith("breakpoint"))})&&this.render()})),Li(this,$n,this.render.bind(this)),vc(this,_c,i_).call(this,"template")}get mediaController(){return this.renderRoot.querySelector("media-controller")}get template(){var t;return(t=aa(this,Ar))!=null?t:this.constructor.template}set template(t){if(t===null){this.removeAttribute("template");return}typeof t=="string"?this.setAttribute("template",t):t instanceof HTMLTemplateElement&&(Li(this,Ar,t),Li(this,kr,null),this.createRenderer())}get props(){var t,i,a;const r=[...Array.from((i=(t=this.mediaController)==null?void 0:t.attributes)!=null?i:[]).filter(({name:s})=>Ec[s]||s.startsWith("breakpoint")),...Array.from(this.attributes)],n={};for(const s of r){const o=(a=Ec[s.name])!=null?a:dy(s.name);let{value:l}=s;l!=null?(ep(l)&&(l=parseFloat(l)),n[o]=l===""?!0:l):n[o]=!1}return n}attributeChangedCallback(t,i,a){t==="template"&&i!=a&&vc(this,ol,fc).call(this)}connectedCallback(){this.addEventListener(zt.BREAKPOINTS_COMPUTED,aa(this,$n)),aa(this,wr).observe(this,{attributes:!0}),aa(this,wr).observe(this.renderRoot,{attributes:!0,subtree:!0}),vc(this,ol,fc).call(this)}disconnectedCallback(){this.removeEventListener(zt.BREAKPOINTS_COMPUTED,aa(this,$n)),aa(this,wr).disconnect()}createRenderer(){this.template instanceof HTMLTemplateElement&&this.template!==aa(this,sl)&&(Li(this,sl,this.template),this.renderer=new rl(this.template,this.props,this.constructor.processor),this.renderRoot.textContent="",this.renderRoot.append(a_.content.cloneNode(!0),this.renderer))}render(){var t;(t=this.renderer)==null||t.update(this.props)}}Ar=new WeakMap,sl=new WeakMap,kr=new WeakMap,wr=new WeakMap,_c=new WeakSet,i_=function(e){if(Object.prototype.hasOwnProperty.call(this,e)){const t=this[e];delete this[e],this[e]=t}},ol=new WeakSet,fc=function(){var e;const t=this.getAttribute("template");if(!t||t===aa(this,kr))return;const i=this.getRootNode(),a=(e=i==null?void 0:i.getElementById)==null?void 0:e.call(i,t);if(a){Li(this,kr,t),Li(this,Ar,a),this.createRenderer();return}uA(t)&&(Li(this,kr,t),cA(t).then(r=>{const n=Le.createElement("template");n.innerHTML=r,Li(this,Ar,n),this.createRenderer()}).catch(console.error))},$n=new WeakMap,ll.observedAttributes=["template"],ll.processor=mc;function uA(e){if(!/^(\/|\.\/|https?:\/\/)/.test(e))return!1;const t=/^https?:\/\//.test(e)?void 0:location.origin;try{new URL(e,t)}catch(i){return!1}return!0}function cA(e){return W(this,null,function*(){const t=yield fetch(e);if(t.status!==200)throw new Error(`Failed to load resource: the server responded with a status of ${t.status}`);return t.text()})}b.customElements.get("media-theme")||b.customElements.define("media-theme",ll);function hA({anchor:e,floating:t,placement:i}){const a=mA({anchor:e,floating:t}),{x:r,y:n}=vA(a,i);return{x:r,y:n}}function mA({anchor:e,floating:t}){return{anchor:pA(e,t.offsetParent),floating:{x:0,y:0,width:t.offsetWidth,height:t.offsetHeight}}}function pA(e,t){var i;const a=e.getBoundingClientRect(),r=(i=t==null?void 0:t.getBoundingClientRect())!=null?i:{x:0,y:0};return{x:a.x-r.x,y:a.y-r.y,width:a.width,height:a.height}}function vA({anchor:e,floating:t},i){const a=_A(i)==="x"?"y":"x",r=a==="y"?"height":"width",n=r_(i),s=e.x+e.width/2-t.width/2,o=e.y+e.height/2-t.height/2,l=e[r]/2-t[r]/2;let c;switch(n){case"top":c={x:s,y:e.y-t.height};break;case"bottom":c={x:s,y:e.y+e.height};break;case"right":c={x:e.x+e.width,y:o};break;case"left":c={x:e.x-t.width,y:o};break;default:c={x:e.x,y:e.y}}switch(i.split("-")[1]){case"start":c[a]-=l;break;case"end":c[a]+=l;break}return c}function r_(e){return e.split("-")[0]}function _A(e){return["top","bottom"].includes(r_(e))?"y":"x"}class bc extends Event{constructor(r){var n=r,{action:t="auto",relatedTarget:i}=n,a=Yr(n,["action","relatedTarget"]);super("invoke",a),this.action=t,this.relatedTarget=i}}class fA extends Event{constructor(r){var n=r,{newState:t,oldState:i}=n,a=Yr(n,["newState","oldState"]);super("toggle",a),this.newState=t,this.oldState=i}}var gc=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},te=(e,t,i)=>(gc(e,t,"read from private field"),i?i.call(e):t.get(e)),oe=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},At=(e,t,i,a)=>(gc(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),le=(e,t,i)=>(gc(e,t,"access private method"),i),li,ra,Ci,dl,Vn,Ca,qn,yc,n_,ul,Tc,cl,hl,Ac,kc,s_,wc,o_,Sc,l_,Sr,Ir,Rr,Yn,ml,Ic,Rc,d_,Lc,u_,Cc,c_,Mc,h_,Dc,m_,xc,p_,Gn,pl,Oc,v_,zn,vl,_l,Nc;function Lr({type:e,text:t,value:i,checked:a}){const r=Le.createElement("media-chrome-menu-item");r.type=e!=null?e:"",r.part.add("menu-item"),e&&r.part.add(e),r.value=i,r.checked=a;const n=Le.createElement("span");return n.textContent=t,r.append(n),r}function Ma(e,t){let i=e.querySelector(`:scope > [slot="${t}"]`);if((i==null?void 0:i.nodeName)=="SLOT"&&(i=i.assignedElements({flatten:!0})[0]),i)return i=i.cloneNode(!0),i;const a=e.shadowRoot.querySelector(`[name="${t}"] > svg`);return a?a.cloneNode(!0):""}function EA(e){return`
    <style>
      :host {
        font: var(--media-font,
          var(--media-font-weight, normal)
          var(--media-font-size, 14px) /
          var(--media-text-content-height, var(--media-control-height, 24px))
          var(--media-font-family, helvetica neue, segoe ui, roboto, arial, sans-serif));
        color: var(--media-text-color, var(--media-primary-color, rgb(238 238 238)));
        --_menu-bg: rgb(20 20 30 / .8);
        background: var(--media-menu-background, var(--media-control-background, var(--media-secondary-color, var(--_menu-bg))));
        border-radius: var(--media-menu-border-radius);
        border: var(--media-menu-border, none);
        display: var(--media-menu-display, inline-flex) !important;
        
        transition: var(--media-menu-transition-in,
          visibility 0s,
          opacity .2s ease-out,
          transform .15s ease-out,
          left .2s ease-in-out,
          min-width .2s ease-in-out,
          min-height .2s ease-in-out
        ) !important;
        
        visibility: var(--media-menu-visibility, visible);
        opacity: var(--media-menu-opacity, 1);
        max-height: var(--media-menu-max-height, var(--_menu-max-height, 300px));
        transform: var(--media-menu-transform-in, translateY(0) scale(1));
        flex-direction: column;
        
        min-height: 0;
        position: relative;
        bottom: var(--_menu-bottom);
        box-sizing: border-box;
      } 

      @-moz-document url-prefix() {
        :host{
          --_menu-bg: rgb(20 20 30);
        }
      }

      :host([hidden]) {
        transition: var(--media-menu-transition-out,
          visibility .15s ease-in,
          opacity .15s ease-in,
          transform .15s ease-in
        ) !important;
        visibility: var(--media-menu-hidden-visibility, hidden);
        opacity: var(--media-menu-hidden-opacity, 0);
        max-height: var(--media-menu-hidden-max-height,
          var(--media-menu-max-height, var(--_menu-max-height, 300px)));
        transform: var(--media-menu-transform-out, translateY(2px) scale(.99));
        pointer-events: none;
      }

      :host([slot="submenu"]) {
        background: none;
        width: 100%;
        min-height: 100%;
        position: absolute;
        bottom: 0;
        right: -100%;
      }

      #container {
        display: flex;
        flex-direction: column;
        min-height: 0;
        transition: transform .2s ease-out;
        transform: translate(0, 0);
      }

      #container.has-expanded {
        transition: transform .2s ease-in;
        transform: translate(-100%, 0);
      }

      button {
        background: none;
        color: inherit;
        border: none;
        padding: 0;
        font: inherit;
        outline: inherit;
        display: inline-flex;
        align-items: center;
      }

      slot[name="header"][hidden] {
        display: none;
      }

      slot[name="header"] > *,
      slot[name="header"]::slotted(*) {
        padding: .4em .7em;
        border-bottom: 1px solid rgb(255 255 255 / .25);
        cursor: var(--media-cursor, default);
      }

      slot[name="header"] > button[part~="back"],
      slot[name="header"]::slotted(button[part~="back"]) {
        cursor: var(--media-cursor, pointer);
      }

      svg[part~="back"] {
        height: var(--media-menu-icon-height, var(--media-control-height, 24px));
        fill: var(--media-icon-color, var(--media-primary-color, rgb(238 238 238)));
        display: block;
        margin-right: .5ch;
      }

      slot:not([name]) {
        gap: var(--media-menu-gap);
        flex-direction: var(--media-menu-flex-direction, column);
        overflow: var(--media-menu-overflow, hidden auto);
        display: flex;
        min-height: 0;
      }

      :host([role="menu"]) slot:not([name]) {
        padding-block: .4em;
      }

      slot:not([name])::slotted([role="menu"]) {
        background: none;
      }

      media-chrome-menu-item > span {
        margin-right: .5ch;
        max-width: var(--media-menu-item-max-width);
        text-overflow: ellipsis;
        overflow: hidden;
      }
    </style>
    <style id="layout-row" media="width:0">

      slot[name="header"] > *,
      slot[name="header"]::slotted(*) {
        padding: .4em .5em;
      }

      slot:not([name]) {
        gap: var(--media-menu-gap, .25em);
        flex-direction: var(--media-menu-flex-direction, row);
        padding-inline: .5em;
      }

      media-chrome-menu-item {
        padding: .3em .5em;
      }

      media-chrome-menu-item[aria-checked="true"] {
        background: var(--media-menu-item-checked-background, rgb(255 255 255 / .2));
      }

      
      media-chrome-menu-item::part(checked-indicator) {
        display: var(--media-menu-item-checked-indicator-display, none);
      }
    </style>
    <div id="container" part="container">
      <slot name="header" hidden>
        <button part="back button" aria-label="Back to previous menu">
          <slot name="back-icon">
            <svg aria-hidden="true" viewBox="0 0 20 24" part="back indicator">
              <path d="m11.88 17.585.742-.669-4.2-4.665 4.2-4.666-.743-.669-4.803 5.335 4.803 5.334Z"/>
            </svg>
          </slot>
          <slot name="title"></slot>
        </button>
      </slot>
      <slot></slot>
    </div>
    <slot name="checked-indicator" hidden></slot>
  `}const Da={STYLE:"style",HIDDEN:"hidden",DISABLED:"disabled",ANCHOR:"anchor"};class kt extends b.HTMLElement{constructor(){if(super(),oe(this,yc),oe(this,ul),oe(this,hl),oe(this,kc),oe(this,wc),oe(this,Sc),oe(this,Rr),oe(this,ml),oe(this,Rc),oe(this,Lc),oe(this,Cc),oe(this,Mc),oe(this,Dc),oe(this,xc),oe(this,Gn),oe(this,Oc),oe(this,zn),oe(this,_l),oe(this,li,null),oe(this,ra,null),oe(this,Ci,null),oe(this,dl,new Set),oe(this,Vn,void 0),oe(this,Ca,!1),oe(this,qn,null),oe(this,cl,()=>{const t=te(this,dl),i=new Set(this.items);for(const a of t)i.has(a)||this.dispatchEvent(new CustomEvent("removemenuitem",{detail:a}));for(const a of i)t.has(a)||this.dispatchEvent(new CustomEvent("addmenuitem",{detail:a}));At(this,dl,i)}),oe(this,Sr,()=>{le(this,Rr,Yn).call(this),le(this,ml,Ic).call(this,!1)}),oe(this,Ir,()=>{le(this,Rr,Yn).call(this)}),!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);const t=ut(this.attributes);this.shadowRoot.innerHTML=this.constructor.getTemplateHTML(t)}this.container=this.shadowRoot.querySelector("#container"),this.defaultSlot=this.shadowRoot.querySelector("slot:not([name])"),At(this,Vn,new MutationObserver(te(this,cl)))}static get observedAttributes(){return[Da.DISABLED,Da.HIDDEN,Da.STYLE,Da.ANCHOR,ae.MEDIA_CONTROLLER]}static formatMenuItemText(t,i){return t}enable(){this.addEventListener("click",this),this.addEventListener("focusout",this),this.addEventListener("keydown",this),this.addEventListener("invoke",this),this.addEventListener("toggle",this)}disable(){this.removeEventListener("click",this),this.removeEventListener("focusout",this),this.removeEventListener("keyup",this),this.removeEventListener("invoke",this),this.removeEventListener("toggle",this)}handleEvent(t){switch(t.type){case"slotchange":le(this,yc,n_).call(this,t);break;case"invoke":le(this,kc,s_).call(this,t);break;case"click":le(this,Rc,d_).call(this,t);break;case"toggle":le(this,Cc,c_).call(this,t);break;case"focusout":le(this,Dc,m_).call(this,t);break;case"keydown":le(this,xc,p_).call(this,t);break}}connectedCallback(){var t,i;te(this,Vn).observe(this.defaultSlot,{childList:!0}),At(this,qn,Jd(this.shadowRoot,":host")),le(this,hl,Ac).call(this),this.hasAttribute("disabled")||this.enable(),this.role||(this.role="menu"),At(this,li,jd(this)),(i=(t=te(this,li))==null?void 0:t.associateElement)==null||i.call(t,this),this.hidden||(Ya(Qn(this),te(this,Sr)),Ya(this,te(this,Ir))),le(this,ul,Tc).call(this),this.shadowRoot.addEventListener("slotchange",this)}disconnectedCallback(){var t,i;te(this,Vn).disconnect(),Ga(Qn(this),te(this,Sr)),Ga(this,te(this,Ir)),this.disable(),(i=(t=te(this,li))==null?void 0:t.unassociateElement)==null||i.call(t,this),At(this,li,null),At(this,ra,null),At(this,Ci,null),this.shadowRoot.removeEventListener("slotchange",this)}attributeChangedCallback(t,i,a){var r,n,s,o;t===Da.HIDDEN&&a!==i?(te(this,Ca)||At(this,Ca,!0),this.hidden?le(this,Sc,l_).call(this):le(this,wc,o_).call(this),this.dispatchEvent(new fA({oldState:this.hidden?"open":"closed",newState:this.hidden?"closed":"open",bubbles:!0}))):t===ae.MEDIA_CONTROLLER?(i&&((n=(r=te(this,li))==null?void 0:r.unassociateElement)==null||n.call(r,this),At(this,li,null)),a&&this.isConnected&&(At(this,li,jd(this)),(o=(s=te(this,li))==null?void 0:s.associateElement)==null||o.call(s,this))):t===Da.DISABLED&&a!==i?a==null?this.enable():this.disable():t===Da.STYLE&&a!==i&&le(this,hl,Ac).call(this)}formatMenuItemText(t,i){return this.constructor.formatMenuItemText(t,i)}get anchor(){return this.getAttribute("anchor")}set anchor(t){this.setAttribute("anchor",`${t}`)}get anchorElement(){var t;return this.anchor?(t=$s(this))==null?void 0:t.querySelector(`#${this.anchor}`):null}get items(){return this.defaultSlot.assignedElements({flatten:!0}).filter(bA)}get radioGroupItems(){return this.items.filter(t=>t.role==="menuitemradio")}get checkedItems(){return this.items.filter(t=>t.checked)}get value(){var t,i;return(i=(t=this.checkedItems[0])==null?void 0:t.value)!=null?i:""}set value(t){const i=this.items.find(a=>a.value===t);i&&le(this,_l,Nc).call(this,i)}focus(){if(At(this,ra,Xd()),this.items.length){le(this,zn,vl).call(this,this.items[0]),this.items[0].focus();return}const t=this.querySelector('[autofocus], [tabindex]:not([tabindex="-1"]), [role="menu"]');t==null||t.focus()}handleSelect(t){var i;const a=le(this,Gn,pl).call(this,t);a&&(le(this,_l,Nc).call(this,a,a.type==="checkbox"),te(this,Ci)&&!this.hidden&&((i=te(this,ra))==null||i.focus(),this.hidden=!0))}get keysUsed(){return["Enter","Escape","Tab"," ","ArrowDown","ArrowUp","Home","End"]}handleMove(t){var i,a;const{key:r}=t,n=this.items,s=(a=(i=le(this,Gn,pl).call(this,t))!=null?i:le(this,Oc,v_).call(this))!=null?a:n[0],o=n.indexOf(s);let l=Math.max(0,o);r==="ArrowDown"?l++:r==="ArrowUp"?l--:t.key==="Home"?l=0:t.key==="End"&&(l=n.length-1),l<0&&(l=n.length-1),l>n.length-1&&(l=0),le(this,zn,vl).call(this,n[l]),n[l].focus()}}li=new WeakMap,ra=new WeakMap,Ci=new WeakMap,dl=new WeakMap,Vn=new WeakMap,Ca=new WeakMap,qn=new WeakMap,yc=new WeakSet,n_=function(e){const t=e.target;for(const i of t.assignedNodes({flatten:!0}))i.nodeType===3&&i.textContent.trim()===""&&i.remove();["header","title"].includes(t.name)&&le(this,ul,Tc).call(this),t.name||te(this,cl).call(this)},ul=new WeakSet,Tc=function(){const e=this.shadowRoot.querySelector('slot[name="header"]'),t=this.shadowRoot.querySelector('slot[name="title"]');e.hidden=t.assignedNodes().length===0&&e.assignedNodes().length===0},cl=new WeakMap,hl=new WeakSet,Ac=function(){var e;const t=this.shadowRoot.querySelector("#layout-row"),i=(e=getComputedStyle(this).getPropertyValue("--media-menu-layout"))==null?void 0:e.trim();t.setAttribute("media",i==="row"?"":"width:0")},kc=new WeakSet,s_=function(e){At(this,Ci,e.relatedTarget),ki(this,e.relatedTarget)||(this.hidden=!this.hidden)},wc=new WeakSet,o_=function(){var e;(e=te(this,Ci))==null||e.setAttribute("aria-expanded","true"),this.addEventListener("transitionend",()=>this.focus(),{once:!0}),Ya(Qn(this),te(this,Sr)),Ya(this,te(this,Ir))},Sc=new WeakSet,l_=function(){var e;(e=te(this,Ci))==null||e.setAttribute("aria-expanded","false"),Ga(Qn(this),te(this,Sr)),Ga(this,te(this,Ir))},Sr=new WeakMap,Ir=new WeakMap,Rr=new WeakSet,Yn=function(e){if(this.hasAttribute("mediacontroller")&&!this.anchor||this.hidden||!this.anchorElement)return;const{x:t,y:i}=hA({anchor:this.anchorElement,floating:this,placement:"top-start"});e!=null||(e=this.offsetWidth);const r=Qn(this).getBoundingClientRect(),n=r.width-t-e,s=r.height-i-this.offsetHeight,{style:o}=te(this,qn);o.setProperty("position","absolute"),o.setProperty("right",`${Math.max(0,n)}px`),o.setProperty("--_menu-bottom",`${s}px`);const l=getComputedStyle(this),p=o.getPropertyValue("--_menu-bottom")===l.bottom?s:parseFloat(l.bottom),v=r.height-p-parseFloat(l.marginBottom);this.style.setProperty("--_menu-max-height",`${v}px`)},ml=new WeakSet,Ic=function(e){const t=this.querySelector('[role="menuitem"][aria-haspopup][aria-expanded="true"]'),i=t==null?void 0:t.querySelector('[role="menu"]'),{style:a}=te(this,qn);if(e||a.setProperty("--media-menu-transition-in","none"),i){const r=i.offsetHeight,n=Math.max(i.offsetWidth,t.offsetWidth);this.style.setProperty("min-width",`${n}px`),this.style.setProperty("min-height",`${r}px`),le(this,Rr,Yn).call(this,n)}else this.style.removeProperty("min-width"),this.style.removeProperty("min-height"),le(this,Rr,Yn).call(this);a.removeProperty("--media-menu-transition-in")},Rc=new WeakSet,d_=function(e){var t;if(e.stopPropagation(),e.composedPath().includes(te(this,Lc,u_))){(t=te(this,ra))==null||t.focus(),this.hidden=!0;return}const i=le(this,Gn,pl).call(this,e);!i||i.hasAttribute("disabled")||(le(this,zn,vl).call(this,i),this.handleSelect(e))},Lc=new WeakSet,u_=function(){var e;return(e=this.shadowRoot.querySelector('slot[name="header"]').assignedElements({flatten:!0}))==null?void 0:e.find(i=>i.matches('button[part~="back"]'))},Cc=new WeakSet,c_=function(e){if(e.target===this)return;le(this,Mc,h_).call(this);const t=Array.from(this.querySelectorAll('[role="menuitem"][aria-haspopup]'));for(const i of t)i.invokeTargetElement!=e.target&&e.newState=="open"&&i.getAttribute("aria-expanded")=="true"&&!i.invokeTargetElement.hidden&&i.invokeTargetElement.dispatchEvent(new bc({relatedTarget:i}));for(const i of t)i.setAttribute("aria-expanded",`${!i.submenuElement.hidden}`);le(this,ml,Ic).call(this,!0)},Mc=new WeakSet,h_=function(){const t=this.querySelector('[role="menuitem"] > [role="menu"]:not([hidden])');this.container.classList.toggle("has-expanded",!!t)},Dc=new WeakSet,m_=function(e){var t;ki(this,e.relatedTarget)||(te(this,Ca)&&((t=te(this,ra))==null||t.focus()),te(this,Ci)&&te(this,Ci)!==e.relatedTarget&&!this.hidden&&(this.hidden=!0))},xc=new WeakSet,p_=function(e){var t,i,a,r,n;const{key:s,ctrlKey:o,altKey:l,metaKey:c}=e;if(!(o||l||c)&&this.keysUsed.includes(s))if(e.preventDefault(),e.stopPropagation(),s==="Tab"){if(te(this,Ca)){this.hidden=!0;return}e.shiftKey?(i=(t=this.previousElementSibling)==null?void 0:t.focus)==null||i.call(t):(r=(a=this.nextElementSibling)==null?void 0:a.focus)==null||r.call(a),this.blur()}else s==="Escape"?((n=te(this,ra))==null||n.focus(),te(this,Ca)&&(this.hidden=!0)):s==="Enter"||s===" "?this.handleSelect(e):this.handleMove(e)},Gn=new WeakSet,pl=function(e){return e.composedPath().find(t=>["menuitemradio","menuitemcheckbox"].includes(t.role))},Oc=new WeakSet,v_=function(){return this.items.find(e=>e.tabIndex===0)},zn=new WeakSet,vl=function(e){for(const t of this.items)t.tabIndex=t===e?0:-1},_l=new WeakSet,Nc=function(e,t){const i=[...this.checkedItems];e.type==="radio"&&this.radioGroupItems.forEach(a=>a.checked=!1),t?e.checked=!e.checked:e.checked=!0,this.checkedItems.some((a,r)=>a!=i[r])&&this.dispatchEvent(new Event("change",{bubbles:!0,composed:!0}))},kt.shadowRootOptions={mode:"open"},kt.getTemplateHTML=EA;function bA(e){return["menuitem","menuitemradio","menuitemcheckbox"].includes(e==null?void 0:e.role)}function Qn(e){var t;return(t=e.getAttribute("bounds")?za(e,`#${e.getAttribute("bounds")}`):at(e)||e.parentElement)!=null?t:e}b.customElements.get("media-chrome-menu")||b.customElements.define("media-chrome-menu",kt);var ES=null,Pc=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},Xe=(e,t,i)=>(Pc(e,t,"read from private field"),i?i.call(e):t.get(e)),Mi=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},Uc=(e,t,i,a)=>(Pc(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),Cr=(e,t,i)=>(Pc(e,t,"access private method"),i),fl,Zn,Bc,__,El,Hc,Wc,f_,di,Mr,Fc,bl,Kc;function gA(e){return`
    <style>
      :host {
        transition: var(--media-menu-item-transition,
          background .15s linear,
          opacity .2s ease-in-out
        );
        outline: var(--media-menu-item-outline, 0);
        outline-offset: var(--media-menu-item-outline-offset, -1px);
        cursor: var(--media-cursor, pointer);
        display: flex;
        align-items: center;
        align-self: stretch;
        justify-self: stretch;
        white-space: nowrap;
        white-space-collapse: collapse;
        text-wrap: nowrap;
        padding: .4em .8em .4em 1em;
      }

      :host(:focus-visible) {
        box-shadow: var(--media-menu-item-focus-shadow, inset 0 0 0 2px rgb(27 127 204 / .9));
        outline: var(--media-menu-item-hover-outline, 0);
        outline-offset: var(--media-menu-item-hover-outline-offset,  var(--media-menu-item-outline-offset, -1px));
      }

      :host(:hover) {
        cursor: var(--media-cursor, pointer);
        background: var(--media-menu-item-hover-background, rgb(92 92 102 / .5));
        outline: var(--media-menu-item-hover-outline);
        outline-offset: var(--media-menu-item-hover-outline-offset,  var(--media-menu-item-outline-offset, -1px));
      }

      :host([aria-checked="true"]) {
        background: var(--media-menu-item-checked-background);
      }

      :host([hidden]) {
        display: none;
      }

      :host([disabled]) {
        pointer-events: none;
        color: rgba(255, 255, 255, .3);
      }

      slot:not([name]) {
        width: 100%;
      }

      slot:not([name="submenu"]) {
        display: inline-flex;
        align-items: center;
        transition: inherit;
        opacity: var(--media-menu-item-opacity, 1);
      }

      slot[name="description"] {
        justify-content: end;
      }

      slot[name="description"] > span {
        display: inline-block;
        margin-inline: 1em .2em;
        max-width: var(--media-menu-item-description-max-width, 100px);
        text-overflow: ellipsis;
        overflow: hidden;
        font-size: .8em;
        font-weight: 400;
        text-align: right;
        position: relative;
        top: .04em;
      }

      slot[name="checked-indicator"] {
        display: none;
      }

      :host(:is([role="menuitemradio"],[role="menuitemcheckbox"])) slot[name="checked-indicator"] {
        display: var(--media-menu-item-checked-indicator-display, inline-block);
      }

      
      svg, img, ::slotted(svg), ::slotted(img) {
        height: var(--media-menu-item-icon-height, var(--media-control-height, 24px));
        fill: var(--media-icon-color, var(--media-primary-color, rgb(238 238 238)));
        display: block;
      }

      
      [part~="indicator"],
      ::slotted([part~="indicator"]) {
        fill: var(--media-menu-item-indicator-fill,
          var(--media-icon-color, var(--media-primary-color, rgb(238 238 238))));
        height: var(--media-menu-item-indicator-height, 1.25em);
        margin-right: .5ch;
      }

      [part~="checked-indicator"] {
        visibility: hidden;
      }

      :host([aria-checked="true"]) [part~="checked-indicator"] {
        visibility: visible;
      }
    </style>
    <slot name="checked-indicator">
      <svg aria-hidden="true" viewBox="0 1 24 24" part="checked-indicator indicator">
        <path d="m10 15.17 9.193-9.191 1.414 1.414-10.606 10.606-6.364-6.364 1.414-1.414 4.95 4.95Z"/>
      </svg>
    </slot>
    <slot name="prefix"></slot>
    <slot></slot>
    <slot name="description"></slot>
    <slot name="suffix">
      ${this.getSuffixSlotInnerHTML(e)}
    </slot>
    <slot name="submenu"></slot>
  `}function yA(e){return""}const wt={TYPE:"type",VALUE:"value",CHECKED:"checked",DISABLED:"disabled"};class na extends b.HTMLElement{constructor(){if(super(),Mi(this,Bc),Mi(this,El),Mi(this,Wc),Mi(this,bl),Mi(this,fl,!1),Mi(this,Zn,void 0),Mi(this,di,()=>{var t,i;this.submenuElement.items&&this.setAttribute("submenusize",`${this.submenuElement.items.length}`);const a=this.shadowRoot.querySelector('slot[name="description"]'),r=(t=this.submenuElement.checkedItems)==null?void 0:t[0],n=(i=r==null?void 0:r.dataset.description)!=null?i:r==null?void 0:r.text,s=Le.createElement("span");s.textContent=n!=null?n:"",a.replaceChildren(s)}),Mi(this,Mr,t=>{const{key:i}=t;if(!this.keysUsed.includes(i)){this.removeEventListener("keyup",Xe(this,Mr));return}this.handleClick(t)}),Mi(this,Fc,t=>{const{metaKey:i,altKey:a,key:r}=t;if(i||a||!this.keysUsed.includes(r)){this.removeEventListener("keyup",Xe(this,Mr));return}this.addEventListener("keyup",Xe(this,Mr),{once:!0})}),!this.shadowRoot){this.attachShadow(this.constructor.shadowRootOptions);const t=ut(this.attributes);this.shadowRoot.innerHTML=this.constructor.getTemplateHTML(t)}}static get observedAttributes(){return[wt.TYPE,wt.DISABLED,wt.CHECKED,wt.VALUE]}enable(){this.hasAttribute("tabindex")||this.setAttribute("tabindex","-1"),jn(this)&&!this.hasAttribute("aria-checked")&&this.setAttribute("aria-checked","false"),this.addEventListener("click",this),this.addEventListener("keydown",this)}disable(){this.removeAttribute("tabindex"),this.removeEventListener("click",this),this.removeEventListener("keydown",this),this.removeEventListener("keyup",this)}handleEvent(t){switch(t.type){case"slotchange":Cr(this,Bc,__).call(this,t);break;case"click":this.handleClick(t);break;case"keydown":Xe(this,Fc).call(this,t);break;case"keyup":Xe(this,Mr).call(this,t);break}}attributeChangedCallback(t,i,a){t===wt.CHECKED&&jn(this)&&!Xe(this,fl)?this.setAttribute("aria-checked",a!=null?"true":"false"):t===wt.TYPE&&a!==i?this.role="menuitem"+a:t===wt.DISABLED&&a!==i&&(a==null?this.enable():this.disable())}connectedCallback(){this.hasAttribute(wt.DISABLED)||this.enable(),this.role="menuitem"+this.type,Uc(this,Zn,$c(this,this.parentNode)),Cr(this,bl,Kc).call(this),this.submenuElement&&Cr(this,El,Hc).call(this),this.shadowRoot.addEventListener("slotchange",this)}disconnectedCallback(){this.disable(),Cr(this,bl,Kc).call(this),Uc(this,Zn,null),this.shadowRoot.removeEventListener("slotchange",this)}get invokeTarget(){return this.getAttribute("invoketarget")}set invokeTarget(t){this.setAttribute("invoketarget",`${t}`)}get invokeTargetElement(){var t;return this.invokeTarget?(t=$s(this))==null?void 0:t.querySelector(`#${this.invokeTarget}`):this.submenuElement}get submenuElement(){return this.shadowRoot.querySelector('slot[name="submenu"]').assignedElements({flatten:!0})[0]}get type(){var t;return(t=this.getAttribute(wt.TYPE))!=null?t:""}set type(t){this.setAttribute(wt.TYPE,`${t}`)}get value(){var t;return(t=this.getAttribute(wt.VALUE))!=null?t:this.text}set value(t){this.setAttribute(wt.VALUE,t)}get text(){var t;return((t=this.textContent)!=null?t:"").trim()}get checked(){if(jn(this))return this.getAttribute("aria-checked")==="true"}set checked(t){jn(this)&&(Uc(this,fl,!0),this.setAttribute("aria-checked",t?"true":"false"),t?this.part.add("checked"):this.part.remove("checked"))}handleClick(t){jn(this)||this.invokeTargetElement&&ki(this,t.target)&&this.invokeTargetElement.dispatchEvent(new bc({relatedTarget:this}))}get keysUsed(){return["Enter"," "]}}fl=new WeakMap,Zn=new WeakMap,Bc=new WeakSet,__=function(e){const t=e.target;if(!(t!=null&&t.name))for(const a of t.assignedNodes({flatten:!0}))a instanceof Text&&a.textContent.trim()===""&&a.remove();t.name==="submenu"&&(this.submenuElement?Cr(this,El,Hc).call(this):Cr(this,Wc,f_).call(this))},El=new WeakSet,Hc=function(){return W(this,null,function*(){this.setAttribute("aria-haspopup","menu"),this.setAttribute("aria-expanded",`${!this.submenuElement.hidden}`),this.submenuElement.addEventListener("change",Xe(this,di)),this.submenuElement.addEventListener("addmenuitem",Xe(this,di)),this.submenuElement.addEventListener("removemenuitem",Xe(this,di)),Xe(this,di).call(this)})},Wc=new WeakSet,f_=function(){this.removeAttribute("aria-haspopup"),this.removeAttribute("aria-expanded"),this.submenuElement.removeEventListener("change",Xe(this,di)),this.submenuElement.removeEventListener("addmenuitem",Xe(this,di)),this.submenuElement.removeEventListener("removemenuitem",Xe(this,di)),Xe(this,di).call(this)},di=new WeakMap,Mr=new WeakMap,Fc=new WeakMap,bl=new WeakSet,Kc=function(){var e;const t=(e=Xe(this,Zn))==null?void 0:e.radioGroupItems;if(!t)return;let i=t.filter(a=>a.getAttribute("aria-checked")==="true").pop();i||(i=t[0]);for(const a of t)a.setAttribute("aria-checked","false");i==null||i.setAttribute("aria-checked","true")},na.shadowRootOptions={mode:"open"},na.getTemplateHTML=gA,na.getSuffixSlotInnerHTML=yA;function jn(e){return e.type==="radio"||e.type==="checkbox"}function $c(e,t){if(!e)return null;const{host:i}=e.getRootNode();return!t&&i?$c(e,i):t!=null&&t.items?t:$c(t,t==null?void 0:t.parentNode)}b.customElements.get("media-chrome-menu-item")||b.customElements.define("media-chrome-menu-item",na);var bS=null;function TA(e){return`
    ${kt.getTemplateHTML(e)}
    <style>
      :host {
        --_menu-bg: rgb(20 20 30 / .8);
        background: var(--media-settings-menu-background,
            var(--media-menu-background,
              var(--media-control-background,
                var(--media-secondary-color, var(--_menu-bg)))));
        min-width: var(--media-settings-menu-min-width, 170px);
        border-radius: 2px 2px 0 0;
        overflow: hidden;
      }

      @-moz-document url-prefix() {
        :host{
          --_menu-bg: rgb(20 20 30);
        }
      }

      :host([role="menu"]) {
        
        justify-content: end;
      }

      slot:not([name]) {
        justify-content: var(--media-settings-menu-justify-content);
        flex-direction: var(--media-settings-menu-flex-direction, column);
        overflow: visible;
      }

      #container.has-expanded {
        --media-settings-menu-item-opacity: 0;
      }
    </style>
  `}class E_ extends kt{get anchorElement(){return this.anchor!=="auto"?super.anchorElement:at(this).querySelector("media-settings-menu-button")}}E_.getTemplateHTML=TA,b.customElements.get("media-settings-menu")||b.customElements.define("media-settings-menu",E_);var gS=null;function AA(e){return`
    ${na.getTemplateHTML.call(this,e)}
    <style>
      slot:not([name="submenu"]) {
        opacity: var(--media-settings-menu-item-opacity, var(--media-menu-item-opacity));
      }

      :host([aria-expanded="true"]:hover) {
        background: transparent;
      }
    </style>
  `}function kA(e){return`
    <svg aria-hidden="true" viewBox="0 0 20 24">
      <path d="m8.12 17.585-.742-.669 4.2-4.665-4.2-4.666.743-.669 4.803 5.335-4.803 5.334Z"/>
    </svg>
  `}class gl extends na{}gl.shadowRootOptions={mode:"open"},gl.getTemplateHTML=AA,gl.getSuffixSlotInnerHTML=kA,b.customElements.get("media-settings-menu-item")||b.customElements.define("media-settings-menu-item",gl);var yS=null;class Dr extends Fe{connectedCallback(){super.connectedCallback(),this.invokeTargetElement&&this.setAttribute("aria-haspopup","menu")}get invokeTarget(){return this.getAttribute("invoketarget")}set invokeTarget(t){this.setAttribute("invoketarget",`${t}`)}get invokeTargetElement(){var t;return this.invokeTarget?(t=$s(this))==null?void 0:t.querySelector(`#${this.invokeTarget}`):null}handleClick(){var t;(t=this.invokeTargetElement)==null||t.dispatchEvent(new bc({relatedTarget:this}))}}b.customElements.get("media-chrome-menu-button")||b.customElements.define("media-chrome-menu-button",Dr);var TS=null;function wA(){return`
    <style>
      :host([aria-expanded="true"]) slot[name=tooltip] {
        display: none;
      }
    </style>
    <slot name="icon">
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M4.5 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm7.5 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm7.5 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/>
      </svg>
    </slot>
  `}function SA(){return D("Settings")}class Vc extends Dr{static get observedAttributes(){return[...super.observedAttributes,"target"]}connectedCallback(){super.connectedCallback(),this.setAttribute("aria-label",D("settings"))}get invokeTargetElement(){return this.invokeTarget!=null?super.invokeTargetElement:at(this).querySelector("media-settings-menu")}}Vc.getSlotTemplateHTML=wA,Vc.getTooltipContentHTML=SA,b.customElements.get("media-settings-menu-button")||b.customElements.define("media-settings-menu-button",Vc);var AS=null,qc=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},b_=(e,t,i)=>(qc(e,t,"read from private field"),i?i.call(e):t.get(e)),yl=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},Yc=(e,t,i,a)=>(qc(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),Tl=(e,t,i)=>(qc(e,t,"access private method"),i),Xn,Al,kl,Gc,wl,zc;class IA extends kt{constructor(){super(...arguments),yl(this,kl),yl(this,wl),yl(this,Xn,[]),yl(this,Al,void 0)}static get observedAttributes(){return[...super.observedAttributes,h.MEDIA_AUDIO_TRACK_LIST,h.MEDIA_AUDIO_TRACK_ENABLED,h.MEDIA_AUDIO_TRACK_UNAVAILABLE]}attributeChangedCallback(t,i,a){super.attributeChangedCallback(t,i,a),t===h.MEDIA_AUDIO_TRACK_ENABLED&&i!==a?this.value=a:t===h.MEDIA_AUDIO_TRACK_LIST&&i!==a&&(Yc(this,Xn,sy(a!=null?a:"")),Tl(this,kl,Gc).call(this))}connectedCallback(){super.connectedCallback(),this.addEventListener("change",Tl(this,wl,zc))}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("change",Tl(this,wl,zc))}get anchorElement(){var t;return this.anchor!=="auto"?super.anchorElement:(t=at(this))==null?void 0:t.querySelector("media-audio-track-menu-button")}get mediaAudioTrackList(){return b_(this,Xn)}set mediaAudioTrackList(t){Yc(this,Xn,t),Tl(this,kl,Gc).call(this)}get mediaAudioTrackEnabled(){var t;return(t=_e(this,h.MEDIA_AUDIO_TRACK_ENABLED))!=null?t:""}set mediaAudioTrackEnabled(t){me(this,h.MEDIA_AUDIO_TRACK_ENABLED,t)}}Xn=new WeakMap,Al=new WeakMap,kl=new WeakSet,Gc=function(){if(b_(this,Al)===JSON.stringify(this.mediaAudioTrackList))return;Yc(this,Al,JSON.stringify(this.mediaAudioTrackList));const e=this.mediaAudioTrackList;this.defaultSlot.textContent="",e.sort((t,i)=>t.id.localeCompare(i.id,void 0,{numeric:!0}));for(const t of e){const i=this.formatMenuItemText(t.label,t),a=Lr({type:"radio",text:i,value:`${t.id}`,checked:t.enabled});a.prepend(Ma(this,"checked-indicator")),this.defaultSlot.append(a)}},wl=new WeakSet,zc=function(){if(this.value==null)return;const e=new b.CustomEvent(x.MEDIA_AUDIO_TRACK_REQUEST,{composed:!0,bubbles:!0,detail:this.value});this.dispatchEvent(e)},b.customElements.get("media-audio-track-menu")||b.customElements.define("media-audio-track-menu",IA);var kS=null;const RA=`<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="M11 17H9.5V7H11v10Zm-3-3H6.5v-4H8v4Zm6-5h-1.5v6H14V9Zm3 7h-1.5V8H17v8Z"/>
  <path d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10Zm-2 0a8 8 0 1 0-16 0 8 8 0 0 0 16 0Z"/>
</svg>`;function LA(){return`
    <style>
      :host([aria-expanded="true"]) slot[name=tooltip] {
        display: none;
      }
    </style>
    <slot name="icon">${RA}</slot>
  `}function CA(){return D("Audio")}const g_=e=>{const t=D("Audio");e.setAttribute("aria-label",t)};class Qc extends Dr{static get observedAttributes(){return[...super.observedAttributes,h.MEDIA_AUDIO_TRACK_ENABLED,h.MEDIA_AUDIO_TRACK_UNAVAILABLE]}connectedCallback(){super.connectedCallback(),g_(this)}attributeChangedCallback(t,i,a){super.attributeChangedCallback(t,i,a),t===h.MEDIA_LANG&&g_(this)}get invokeTargetElement(){var t;return this.invokeTarget!=null?super.invokeTargetElement:(t=at(this))==null?void 0:t.querySelector("media-audio-track-menu")}get mediaAudioTrackEnabled(){var t;return(t=_e(this,h.MEDIA_AUDIO_TRACK_ENABLED))!=null?t:""}set mediaAudioTrackEnabled(t){me(this,h.MEDIA_AUDIO_TRACK_ENABLED,t)}}Qc.getSlotTemplateHTML=LA,Qc.getTooltipContentHTML=CA,b.customElements.get("media-audio-track-menu-button")||b.customElements.define("media-audio-track-menu-button",Qc);var wS=null,Zc=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},MA=(e,t,i)=>(Zc(e,t,"read from private field"),i?i.call(e):t.get(e)),jc=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},DA=(e,t,i,a)=>(Zc(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),Sl=(e,t,i)=>(Zc(e,t,"access private method"),i),Il,Rl,Xc,Ll,Jc;const xA=`
  <svg aria-hidden="true" viewBox="0 0 26 24" part="captions-indicator indicator">
    <path d="M22.83 5.68a2.58 2.58 0 0 0-2.3-2.5c-3.62-.24-11.44-.24-15.06 0a2.58 2.58 0 0 0-2.3 2.5c-.23 4.21-.23 8.43 0 12.64a2.58 2.58 0 0 0 2.3 2.5c3.62.24 11.44.24 15.06 0a2.58 2.58 0 0 0 2.3-2.5c.23-4.21.23-8.43 0-12.64Zm-11.39 9.45a3.07 3.07 0 0 1-1.91.57 3.06 3.06 0 0 1-2.34-1 3.75 3.75 0 0 1-.92-2.67 3.92 3.92 0 0 1 .92-2.77 3.18 3.18 0 0 1 2.43-1 2.94 2.94 0 0 1 2.13.78c.364.359.62.813.74 1.31l-1.43.35a1.49 1.49 0 0 0-1.51-1.17 1.61 1.61 0 0 0-1.29.58 2.79 2.79 0 0 0-.5 1.89 3 3 0 0 0 .49 1.93 1.61 1.61 0 0 0 1.27.58 1.48 1.48 0 0 0 1-.37 2.1 2.1 0 0 0 .59-1.14l1.4.44a3.23 3.23 0 0 1-1.07 1.69Zm7.22 0a3.07 3.07 0 0 1-1.91.57 3.06 3.06 0 0 1-2.34-1 3.75 3.75 0 0 1-.92-2.67 3.88 3.88 0 0 1 .93-2.77 3.14 3.14 0 0 1 2.42-1 3 3 0 0 1 2.16.82 2.8 2.8 0 0 1 .73 1.31l-1.43.35a1.49 1.49 0 0 0-1.51-1.21 1.61 1.61 0 0 0-1.29.58A2.79 2.79 0 0 0 15 12a3 3 0 0 0 .49 1.93 1.61 1.61 0 0 0 1.27.58 1.44 1.44 0 0 0 1-.37 2.1 2.1 0 0 0 .6-1.15l1.4.44a3.17 3.17 0 0 1-1.1 1.7Z"/>
  </svg>`;function OA(e){return`
    ${kt.getTemplateHTML(e)}
    <slot name="captions-indicator" hidden>${xA}</slot>
  `}class y_ extends kt{constructor(){super(...arguments),jc(this,Rl),jc(this,Ll),jc(this,Il,void 0)}static get observedAttributes(){return[...super.observedAttributes,h.MEDIA_SUBTITLES_LIST,h.MEDIA_SUBTITLES_SHOWING]}attributeChangedCallback(t,i,a){super.attributeChangedCallback(t,i,a),t===h.MEDIA_SUBTITLES_LIST&&i!==a?Sl(this,Rl,Xc).call(this):t===h.MEDIA_SUBTITLES_SHOWING&&i!==a&&(this.value=a||"",Sl(this,Rl,Xc).call(this))}connectedCallback(){super.connectedCallback(),this.addEventListener("change",Sl(this,Ll,Jc))}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("change",Sl(this,Ll,Jc))}get anchorElement(){return this.anchor!=="auto"?super.anchorElement:at(this).querySelector("media-captions-menu-button")}get mediaSubtitlesList(){return T_(this,h.MEDIA_SUBTITLES_LIST)}set mediaSubtitlesList(t){A_(this,h.MEDIA_SUBTITLES_LIST,t)}get mediaSubtitlesShowing(){return T_(this,h.MEDIA_SUBTITLES_SHOWING)}set mediaSubtitlesShowing(t){A_(this,h.MEDIA_SUBTITLES_SHOWING,t)}}Il=new WeakMap,Rl=new WeakSet,Xc=function(){var e;const t=MA(this,Il)!==JSON.stringify(this.mediaSubtitlesList),i=this.value!==this.getAttribute(h.MEDIA_SUBTITLES_SHOWING);if(!t&&!i)return;DA(this,Il,JSON.stringify(this.mediaSubtitlesList)),this.defaultSlot.textContent="";const a=!this.value,r=Lr({type:"radio",text:this.formatMenuItemText(D("Off")),value:"off",checked:a});r.prepend(Ma(this,"checked-indicator")),this.defaultSlot.append(r);const n=this.mediaSubtitlesList;for(const s of n){const o=Lr({type:"radio",text:this.formatMenuItemText(s.label,s),value:su(s),checked:this.value==su(s)});o.prepend(Ma(this,"checked-indicator")),((e=s.kind)!=null?e:"subs")==="captions"&&o.append(Ma(this,"captions-indicator")),this.defaultSlot.append(o)}},Ll=new WeakSet,Jc=function(){const e=this.mediaSubtitlesShowing,t=this.getAttribute(h.MEDIA_SUBTITLES_SHOWING),i=this.value!==t;if(e!=null&&e.length&&i&&this.dispatchEvent(new b.CustomEvent(x.MEDIA_DISABLE_SUBTITLES_REQUEST,{composed:!0,bubbles:!0,detail:e})),!this.value||!i)return;const a=new b.CustomEvent(x.MEDIA_SHOW_SUBTITLES_REQUEST,{composed:!0,bubbles:!0,detail:this.value});this.dispatchEvent(a)},y_.getTemplateHTML=OA;const T_=(e,t)=>{const i=e.getAttribute(t);return i?eo(i):[]},A_=(e,t,i)=>{if(!(i!=null&&i.length)){e.removeAttribute(t);return}const a=fn(i);e.getAttribute(t)!==a&&e.setAttribute(t,a)};b.customElements.get("media-captions-menu")||b.customElements.define("media-captions-menu",y_);var SS=null;const NA=`<svg aria-hidden="true" viewBox="0 0 26 24">
  <path d="M22.83 5.68a2.58 2.58 0 0 0-2.3-2.5c-3.62-.24-11.44-.24-15.06 0a2.58 2.58 0 0 0-2.3 2.5c-.23 4.21-.23 8.43 0 12.64a2.58 2.58 0 0 0 2.3 2.5c3.62.24 11.44.24 15.06 0a2.58 2.58 0 0 0 2.3-2.5c.23-4.21.23-8.43 0-12.64Zm-11.39 9.45a3.07 3.07 0 0 1-1.91.57 3.06 3.06 0 0 1-2.34-1 3.75 3.75 0 0 1-.92-2.67 3.92 3.92 0 0 1 .92-2.77 3.18 3.18 0 0 1 2.43-1 2.94 2.94 0 0 1 2.13.78c.364.359.62.813.74 1.31l-1.43.35a1.49 1.49 0 0 0-1.51-1.17 1.61 1.61 0 0 0-1.29.58 2.79 2.79 0 0 0-.5 1.89 3 3 0 0 0 .49 1.93 1.61 1.61 0 0 0 1.27.58 1.48 1.48 0 0 0 1-.37 2.1 2.1 0 0 0 .59-1.14l1.4.44a3.23 3.23 0 0 1-1.07 1.69Zm7.22 0a3.07 3.07 0 0 1-1.91.57 3.06 3.06 0 0 1-2.34-1 3.75 3.75 0 0 1-.92-2.67 3.88 3.88 0 0 1 .93-2.77 3.14 3.14 0 0 1 2.42-1 3 3 0 0 1 2.16.82 2.8 2.8 0 0 1 .73 1.31l-1.43.35a1.49 1.49 0 0 0-1.51-1.21 1.61 1.61 0 0 0-1.29.58A2.79 2.79 0 0 0 15 12a3 3 0 0 0 .49 1.93 1.61 1.61 0 0 0 1.27.58 1.44 1.44 0 0 0 1-.37 2.1 2.1 0 0 0 .6-1.15l1.4.44a3.17 3.17 0 0 1-1.1 1.7Z"/>
</svg>`,PA=`<svg aria-hidden="true" viewBox="0 0 26 24">
  <path d="M17.73 14.09a1.4 1.4 0 0 1-1 .37 1.579 1.579 0 0 1-1.27-.58A3 3 0 0 1 15 12a2.8 2.8 0 0 1 .5-1.85 1.63 1.63 0 0 1 1.29-.57 1.47 1.47 0 0 1 1.51 1.2l1.43-.34A2.89 2.89 0 0 0 19 9.07a3 3 0 0 0-2.14-.78 3.14 3.14 0 0 0-2.42 1 3.91 3.91 0 0 0-.93 2.78 3.74 3.74 0 0 0 .92 2.66 3.07 3.07 0 0 0 2.34 1 3.07 3.07 0 0 0 1.91-.57 3.17 3.17 0 0 0 1.07-1.74l-1.4-.45c-.083.43-.3.822-.62 1.12Zm-7.22 0a1.43 1.43 0 0 1-1 .37 1.58 1.58 0 0 1-1.27-.58A3 3 0 0 1 7.76 12a2.8 2.8 0 0 1 .5-1.85 1.63 1.63 0 0 1 1.29-.57 1.47 1.47 0 0 1 1.51 1.2l1.43-.34a2.81 2.81 0 0 0-.74-1.32 2.94 2.94 0 0 0-2.13-.78 3.18 3.18 0 0 0-2.43 1 4 4 0 0 0-.92 2.78 3.74 3.74 0 0 0 .92 2.66 3.07 3.07 0 0 0 2.34 1 3.07 3.07 0 0 0 1.91-.57 3.23 3.23 0 0 0 1.07-1.74l-1.4-.45a2.06 2.06 0 0 1-.6 1.07Zm12.32-8.41a2.59 2.59 0 0 0-2.3-2.51C18.72 3.05 15.86 3 13 3c-2.86 0-5.72.05-7.53.17a2.59 2.59 0 0 0-2.3 2.51c-.23 4.207-.23 8.423 0 12.63a2.57 2.57 0 0 0 2.3 2.5c1.81.13 4.67.19 7.53.19 2.86 0 5.72-.06 7.53-.19a2.57 2.57 0 0 0 2.3-2.5c.23-4.207.23-8.423 0-12.63Zm-1.49 12.53a1.11 1.11 0 0 1-.91 1.11c-1.67.11-4.45.18-7.43.18-2.98 0-5.76-.07-7.43-.18a1.11 1.11 0 0 1-.91-1.11c-.21-4.14-.21-8.29 0-12.43a1.11 1.11 0 0 1 .91-1.11C7.24 4.56 10 4.49 13 4.49s5.76.07 7.43.18a1.11 1.11 0 0 1 .91 1.11c.21 4.14.21 8.29 0 12.43Z"/>
</svg>`;function UA(){return`
    <style>
      :host([data-captions-enabled="true"]) slot[name=off] {
        display: none !important;
      }

      
      :host(:not([data-captions-enabled="true"])) slot[name=on] {
        display: none !important;
      }

      :host([aria-expanded="true"]) slot[name=tooltip] {
        display: none;
      }
    </style>

    <slot name="icon">
      <slot name="on">${NA}</slot>
      <slot name="off">${PA}</slot>
    </slot>
  `}function BA(){return D("Captions")}const k_=e=>{e.setAttribute("data-captions-enabled",kp(e).toString())},w_=e=>{e.setAttribute("aria-label",D("closed captions"))};class eh extends Dr{static get observedAttributes(){return[...super.observedAttributes,h.MEDIA_SUBTITLES_LIST,h.MEDIA_SUBTITLES_SHOWING,h.MEDIA_LANG]}connectedCallback(){super.connectedCallback(),w_(this),k_(this)}attributeChangedCallback(t,i,a){super.attributeChangedCallback(t,i,a),t===h.MEDIA_SUBTITLES_SHOWING?k_(this):t===h.MEDIA_LANG&&w_(this)}get invokeTargetElement(){var t;return this.invokeTarget!=null?super.invokeTargetElement:(t=at(this))==null?void 0:t.querySelector("media-captions-menu")}get mediaSubtitlesList(){return S_(this,h.MEDIA_SUBTITLES_LIST)}set mediaSubtitlesList(t){I_(this,h.MEDIA_SUBTITLES_LIST,t)}get mediaSubtitlesShowing(){return S_(this,h.MEDIA_SUBTITLES_SHOWING)}set mediaSubtitlesShowing(t){I_(this,h.MEDIA_SUBTITLES_SHOWING,t)}}eh.getSlotTemplateHTML=UA,eh.getTooltipContentHTML=BA;const S_=(e,t)=>{const i=e.getAttribute(t);return i?eo(i):[]},I_=(e,t,i)=>{if(!(i!=null&&i.length)){e.removeAttribute(t);return}const a=fn(i);e.getAttribute(t)!==a&&e.setAttribute(t,a)};b.customElements.get("media-captions-menu-button")||b.customElements.define("media-captions-menu-button",eh);var IS=null,R_=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},xr=(e,t,i)=>(R_(e,t,"read from private field"),i?i.call(e):t.get(e)),th=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},Or=(e,t,i)=>(R_(e,t,"access private method"),i),sa,Nr,Jn,Cl,ih;const ah={RATES:"rates"};class HA extends kt{constructor(){super(),th(this,Nr),th(this,Cl),th(this,sa,new nu(this,ah.RATES,{defaultValue:Sv})),Or(this,Nr,Jn).call(this)}static get observedAttributes(){return[...super.observedAttributes,h.MEDIA_PLAYBACK_RATE,ah.RATES]}attributeChangedCallback(t,i,a){super.attributeChangedCallback(t,i,a),t===h.MEDIA_PLAYBACK_RATE&&i!=a?(this.value=a,Or(this,Nr,Jn).call(this)):t===ah.RATES&&i!=a&&(xr(this,sa).value=a,Or(this,Nr,Jn).call(this))}connectedCallback(){super.connectedCallback(),this.addEventListener("change",Or(this,Cl,ih))}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("change",Or(this,Cl,ih))}get anchorElement(){return this.anchor!=="auto"?super.anchorElement:at(this).querySelector("media-playback-rate-menu-button")}get rates(){return xr(this,sa)}set rates(t){t?Array.isArray(t)?xr(this,sa).value=t.join(" "):typeof t=="string"&&(xr(this,sa).value=t):xr(this,sa).value="",Or(this,Nr,Jn).call(this)}get mediaPlaybackRate(){return ce(this,h.MEDIA_PLAYBACK_RATE,1)}set mediaPlaybackRate(t){ge(this,h.MEDIA_PLAYBACK_RATE,t)}}sa=new WeakMap,Nr=new WeakSet,Jn=function(){this.defaultSlot.textContent="";const e=Zi(this.mediaPlaybackRate),t=new Set(Array.from(xr(this,sa)).map(a=>Zi(Number(a))));e>0&&!t.has(e)&&t.add(e);const i=Array.from(t).sort((a,r)=>a-r);for(const a of i){const r=Lr({type:"radio",text:this.formatMenuItemText(`${a}x`,a),value:a.toString(),checked:e===a});r.prepend(Ma(this,"checked-indicator")),this.defaultSlot.append(r)}},Cl=new WeakSet,ih=function(){if(!this.value)return;const e=new b.CustomEvent(x.MEDIA_PLAYBACK_RATE_REQUEST,{composed:!0,bubbles:!0,detail:this.value});this.dispatchEvent(e)},b.customElements.get("media-playback-rate-menu")||b.customElements.define("media-playback-rate-menu",HA);var RS=null;const Ml=1;function WA(e){return`
    <style>
      :host {
        min-width: 5ch;
        padding: var(--media-button-padding, var(--media-control-padding, 10px 5px));
      }

      :host([aria-expanded="true"]) slot {
        display: block;
      }

      :host([aria-expanded="true"]) slot[name=tooltip] {
        display: none;
      }
    </style>
    <slot name="icon">${e.mediaplaybackrate?Zi(+e.mediaplaybackrate):Ml}x</slot>
  `}function FA(){return D("Playback rate")}class rh extends Dr{static get observedAttributes(){return[...super.observedAttributes,h.MEDIA_PLAYBACK_RATE]}constructor(){var t;super(),this.container=this.shadowRoot.querySelector('slot[name="icon"]'),this.container.innerHTML=`${Zi((t=this.mediaPlaybackRate)!=null?t:Ml)}x`}attributeChangedCallback(t,i,a){if(super.attributeChangedCallback(t,i,a),t===h.MEDIA_PLAYBACK_RATE){const r=a?+a:Number.NaN,n=Zi(Number.isNaN(r)?Ml:r);this.container.innerHTML=`${n}x`,this.setAttribute("aria-label",D("Playback rate {playbackRate}",{playbackRate:n}))}}get invokeTargetElement(){return this.invokeTarget!=null?super.invokeTargetElement:at(this).querySelector("media-playback-rate-menu")}get mediaPlaybackRate(){return ce(this,h.MEDIA_PLAYBACK_RATE,Ml)}set mediaPlaybackRate(t){ge(this,h.MEDIA_PLAYBACK_RATE,t)}}rh.getSlotTemplateHTML=WA,rh.getTooltipContentHTML=FA,b.customElements.get("media-playback-rate-menu-button")||b.customElements.define("media-playback-rate-menu-button",rh);var LS=null,nh=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},Di=(e,t,i)=>(nh(e,t,"read from private field"),i?i.call(e):t.get(e)),Dl=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},L_=(e,t,i,a)=>(nh(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),Pr=(e,t,i)=>(nh(e,t,"access private method"),i),es,ui,Ur,ts,xl,sh;class KA extends kt{constructor(){super(...arguments),Dl(this,Ur),Dl(this,xl),Dl(this,es,[]),Dl(this,ui,{})}static get observedAttributes(){return[...super.observedAttributes,h.MEDIA_RENDITION_LIST,h.MEDIA_RENDITION_SELECTED,h.MEDIA_RENDITION_UNAVAILABLE,h.MEDIA_HEIGHT,h.MEDIA_WIDTH]}static formatMenuItemText(t,i){return super.formatMenuItemText(t,i)}static formatRendition(t,{showBitrate:i=!1}={}){const a=`${Math.min(t.width,t.height)}p`;if(i&&t.bitrate){const r=t.bitrate/1e6,n=`${r.toFixed(r<1?1:0)} Mbps`;return`${a} (${n})`}return this.formatMenuItemText(a,t)}static compareRendition(t,i){var a,r;return i.height===t.height?((a=i.bitrate)!=null?a:0)-((r=t.bitrate)!=null?r:0):i.height-t.height}attributeChangedCallback(t,i,a){if(super.attributeChangedCallback(t,i,a),i!==a)switch(t){case h.MEDIA_RENDITION_SELECTED:this.value=a!=null?a:"auto",Pr(this,Ur,ts).call(this);break;case h.MEDIA_RENDITION_LIST:L_(this,es,iy(a)),Pr(this,Ur,ts).call(this);break;case h.MEDIA_HEIGHT:case h.MEDIA_WIDTH:Pr(this,Ur,ts).call(this);break}}connectedCallback(){super.connectedCallback(),this.addEventListener("change",Pr(this,xl,sh))}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("change",Pr(this,xl,sh))}get anchorElement(){return this.anchor!=="auto"?super.anchorElement:at(this).querySelector("media-rendition-menu-button")}get mediaRenditionList(){return Di(this,es)}set mediaRenditionList(t){L_(this,es,t),Pr(this,Ur,ts).call(this)}get mediaRenditionSelected(){return _e(this,h.MEDIA_RENDITION_SELECTED)}set mediaRenditionSelected(t){me(this,h.MEDIA_RENDITION_SELECTED,t)}get mediaHeight(){return ce(this,h.MEDIA_HEIGHT)}set mediaHeight(t){ge(this,h.MEDIA_HEIGHT,t)}get mediaWidth(){return ce(this,h.MEDIA_WIDTH)}set mediaWidth(t){ge(this,h.MEDIA_WIDTH,t)}compareRendition(t,i){return this.constructor.compareRendition(t,i)}formatMenuItemText(t,i){return this.constructor.formatMenuItemText(t,i)}formatRendition(t,i){return this.constructor.formatRendition(t,i)}showRenditionBitrate(t){return this.mediaRenditionList.some(i=>i!==t&&i.height===t.height&&i.bitrate!==t.bitrate)}}es=new WeakMap,ui=new WeakMap,Ur=new WeakSet,ts=function(){const e=!this.mediaRenditionSelected;if(Di(this,ui).mediaRenditionList===JSON.stringify(this.mediaRenditionList)&&Di(this,ui).mediaHeight===this.mediaHeight&&Di(this,ui).mediaWidth===this.mediaWidth&&Di(this,ui).isAuto===e)return;Di(this,ui).mediaRenditionList=JSON.stringify(this.mediaRenditionList),Di(this,ui).mediaHeight=this.mediaHeight,Di(this,ui).mediaWidth=this.mediaWidth,Di(this,ui).isAuto=e;const t=this.mediaRenditionList.sort(this.compareRendition.bind(this)),i=t.find(s=>s.id===this.mediaRenditionSelected);for(const s of t)s.selected=s===i;this.defaultSlot.textContent="";for(const s of t){const o=this.formatRendition(s,{showBitrate:this.showRenditionBitrate(s)}),l=Lr({type:"radio",text:o,value:`${s.id}`,checked:s.selected&&!e});l.prepend(Ma(this,"checked-indicator")),this.defaultSlot.append(l)}const a=i&&this.showRenditionBitrate(i);let r;e&&(i?r=this.formatMenuItemText(`${D("Auto")} \u2022 ${this.formatRendition(i,{showBitrate:a})}`,i):this.mediaHeight>0&&this.mediaWidth>0&&(r=this.formatMenuItemText(`${D("Auto")} (${Math.min(this.mediaWidth,this.mediaHeight)}p)`))),r||(r=this.formatMenuItemText(D("Auto")));const n=Lr({type:"radio",text:r,value:"auto",checked:e});n.dataset.description=r,n.prepend(Ma(this,"checked-indicator")),this.defaultSlot.append(n)},xl=new WeakSet,sh=function(){if(this.value==null)return;const e=new b.CustomEvent(x.MEDIA_RENDITION_REQUEST,{composed:!0,bubbles:!0,detail:this.value});this.dispatchEvent(e)},b.customElements.get("media-rendition-menu")||b.customElements.define("media-rendition-menu",KA);var CS=null;const $A=`<svg aria-hidden="true" viewBox="0 0 24 24">
  <path d="M13.5 2.5h2v6h-2v-2h-11v-2h11v-2Zm4 2h4v2h-4v-2Zm-12 4h2v6h-2v-2h-3v-2h3v-2Zm4 2h12v2h-12v-2Zm1 4h2v6h-2v-2h-8v-2h8v-2Zm4 2h7v2h-7v-2Z" />
</svg>`;function VA(){return`
    <style>
      :host([aria-expanded="true"]) slot[name=tooltip] {
        display: none;
      }
    </style>
    <slot name="icon">${$A}</slot>
  `}function qA(){return D("Quality")}class oh extends Dr{static get observedAttributes(){return[...super.observedAttributes,h.MEDIA_RENDITION_SELECTED,h.MEDIA_RENDITION_UNAVAILABLE,h.MEDIA_HEIGHT]}connectedCallback(){super.connectedCallback(),this.setAttribute("aria-label",D("quality"))}get invokeTargetElement(){return this.invokeTarget!=null?super.invokeTargetElement:at(this).querySelector("media-rendition-menu")}get mediaRenditionSelected(){return _e(this,h.MEDIA_RENDITION_SELECTED)}set mediaRenditionSelected(t){me(this,h.MEDIA_RENDITION_SELECTED,t)}get mediaHeight(){return ce(this,h.MEDIA_HEIGHT)}set mediaHeight(t){ge(this,h.MEDIA_HEIGHT,t)}}oh.getSlotTemplateHTML=VA,oh.getTooltipContentHTML=qA,b.customElements.get("media-rendition-menu-button")||b.customElements.define("media-rendition-menu-button",oh);var MS=null,lh=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},ci=(e,t,i)=>(lh(e,t,"read from private field"),i?i.call(e):t.get(e)),hi=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},C_=(e,t,i,a)=>(lh(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),St=(e,t,i)=>(lh(e,t,"access private method"),i),Br,is,Ol,xa,Hr,dh,M_,Nl,uh,Pl,ch,D_,Ul,Bl,Hl;function YA(e){return`
      ${kt.getTemplateHTML(e)}
      <style>
        :host {
          --_menu-bg: rgb(20 20 30 / .8);
          background: var(--media-settings-menu-background,
            var(--media-menu-background,
              var(--media-control-background,
                var(--media-secondary-color, var(--_menu-bg)))));
          min-width: var(--media-settings-menu-min-width, 170px);
          border-radius: 2px;
          overflow: hidden;
        }
      </style>
    `}class x_ extends kt{constructor(){super(),hi(this,is),hi(this,xa),hi(this,dh),hi(this,Nl),hi(this,ch),hi(this,Br,!1),hi(this,Pl,t=>{const i=t.target,a=(i==null?void 0:i.nodeName)==="VIDEO",r=St(this,Nl,uh).call(this,i);(a||r)&&(ci(this,Br)?St(this,xa,Hr).call(this):St(this,ch,D_).call(this,t))}),hi(this,Ul,t=>{const i=t.target,a=this.contains(i),r=t.button===2,n=(i==null?void 0:i.nodeName)==="VIDEO",s=St(this,Nl,uh).call(this,i);a||r&&(n||s)||St(this,xa,Hr).call(this)}),hi(this,Bl,t=>{t.key==="Escape"&&St(this,xa,Hr).call(this)}),hi(this,Hl,t=>{var i,a;const r=t.target;if((i=r.matches)!=null&&i.call(r,'button[invoke="copy"]')){const n=(a=r.closest("media-context-menu-item"))==null?void 0:a.querySelector('input[slot="copy"]');n&&navigator.clipboard.writeText(n.value)}St(this,xa,Hr).call(this)}),this.setAttribute("noautohide",""),St(this,is,Ol).call(this)}connectedCallback(){super.connectedCallback(),at(this).addEventListener("contextmenu",ci(this,Pl)),this.addEventListener("click",ci(this,Hl))}disconnectedCallback(){super.disconnectedCallback(),at(this).removeEventListener("contextmenu",ci(this,Pl)),this.removeEventListener("click",ci(this,Hl)),document.removeEventListener("mousedown",ci(this,Ul)),document.removeEventListener("keydown",ci(this,Bl))}}Br=new WeakMap,is=new WeakSet,Ol=function(){this.hidden=!ci(this,Br)},xa=new WeakSet,Hr=function(){C_(this,Br,!1),St(this,is,Ol).call(this)},dh=new WeakSet,M_=function(){document.querySelectorAll("media-context-menu").forEach(t=>{var i;t!==this&&St(i=t,xa,Hr).call(i)})},Nl=new WeakSet,uh=function(e){return e?e.hasAttribute("slot")&&e.getAttribute("slot")==="media"?!0:e.nodeName.includes("-")&&e.tagName.includes("-")?e.hasAttribute("src")||e.hasAttribute("poster")||e.hasAttribute("preload")||e.hasAttribute("playsinline"):!1:!1},Pl=new WeakMap,ch=new WeakSet,D_=function(e){e.preventDefault(),St(this,dh,M_).call(this),C_(this,Br,!0),this.style.position="fixed",this.style.left=`${e.clientX}px`,this.style.top=`${e.clientY}px`,St(this,is,Ol).call(this),document.addEventListener("mousedown",ci(this,Ul),{once:!0}),document.addEventListener("keydown",ci(this,Bl),{once:!0})},Ul=new WeakMap,Bl=new WeakMap,Hl=new WeakMap,x_.getTemplateHTML=YA,b.customElements.get("media-context-menu")||b.customElements.define("media-context-menu",x_);var DS=null;function GA(e){return`
    ${na.getTemplateHTML.call(this,e)}
    <style>
        ::slotted(*) {
            color: var(--media-text-color, white);
            text-decoration: none;
            border: none;
            background: none;
            cursor: pointer;
            padding: 0;
            min-height: var(--media-control-height, 24px);
        }
    </style>
  `}class hh extends na{}hh.shadowRootOptions={mode:"open"},hh.getTemplateHTML=GA,b.customElements.get("media-context-menu-item")||b.customElements.define("media-context-menu-item",hh);var xS=null,O_=e=>{throw TypeError(e)},mh=(e,t,i)=>t.has(e)||O_("Cannot "+i),K=(e,t,i)=>(mh(e,t,"read from private field"),i?i.call(e):t.get(e)),Me=(e,t,i)=>t.has(e)?O_("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,i),rt=(e,t,i,a)=>(mh(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),Se=(e,t,i)=>(mh(e,t,"access private method"),i),Wl=class{addEventListener(){}removeEventListener(){}dispatchEvent(e){return!0}};if(typeof DocumentFragment=="undefined"){class e extends Wl{}globalThis.DocumentFragment=e}var ph=class extends Wl{},zA=class extends Wl{},QA={get(e){},define(e,t,i){},getName(e){return null},upgrade(e){},whenDefined(e){return Promise.resolve(ph)}},Fl,ZA=class{constructor(e,t={}){Me(this,Fl),rt(this,Fl,t==null?void 0:t.detail)}get detail(){return K(this,Fl)}initCustomEvent(){}};Fl=new WeakMap;function jA(e,t){return new ph}var N_={document:{createElement:jA},DocumentFragment,customElements:QA,CustomEvent:ZA,EventTarget:Wl,HTMLElement:ph,HTMLVideoElement:zA},P_=typeof window=="undefined"||typeof globalThis.customElements=="undefined",mi=P_?N_:globalThis,Kl=P_?N_.document:globalThis.document;function XA(e){let t="";return Object.entries(e).forEach(([i,a])=>{a!=null&&(t+=`${vh(i)}: ${a}; `)}),t?t.trim():void 0}function vh(e){return e.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase()}function U_(e){return e.replace(/[-_]([a-z])/g,(t,i)=>i.toUpperCase())}function Ge(e){if(e==null)return;let t=+e;return Number.isNaN(t)?void 0:t}function B_(e){let t=JA(e).toString();return t?"?"+t:""}function JA(e){let t={};for(let i in e)e[i]!=null&&(t[i]=e[i]);return new URLSearchParams(t)}var H_=(e,t)=>!e||!t?!1:e.contains(t)?!0:H_(e,t.getRootNode().host),W_="mux.com",ek=()=>{try{return"3.13.2"}catch(e){}return"UNKNOWN"},tk=ek(),F_=()=>tk,ik=(e,{token:t,customDomain:i=W_,thumbnailTime:a,programTime:r}={})=>{var n;let s=t==null?a:void 0,{aud:o}=(n=Ka(t))!=null?n:{};if(!(t&&o!=="t"))return`https://image.${i}/${e}/thumbnail.webp${B_({token:t,time:s,program_time:r})}`},ak=(e,{token:t,customDomain:i=W_,programStartTime:a,programEndTime:r}={})=>{var n;let{aud:s}=(n=Ka(t))!=null?n:{};if(!(t&&s!=="s"))return`https://image.${i}/${e}/storyboard.vtt${B_({token:t,format:"webp",program_start_time:a,program_end_time:r})}`},_h=e=>{if(e){if([se.LIVE,se.ON_DEMAND].includes(e))return e;if(e!=null&&e.includes("live"))return se.LIVE}},rk={crossorigin:"crossOrigin",playsinline:"playsInline"};function nk(e){var t;return(t=rk[e])!=null?t:U_(e)}var Wr,Fr,nt,sk=class{constructor(e,t){Me(this,Wr),Me(this,Fr),Me(this,nt,[]),rt(this,Wr,e),rt(this,Fr,t)}[Symbol.iterator](){return K(this,nt).values()}get length(){return K(this,nt).length}get value(){var e;return(e=K(this,nt).join(" "))!=null?e:""}set value(e){var t;e!==this.value&&(rt(this,nt,[]),this.add(...(t=e==null?void 0:e.split(" "))!=null?t:[]))}toString(){return this.value}item(e){return K(this,nt)[e]}values(){return K(this,nt).values()}keys(){return K(this,nt).keys()}forEach(e){K(this,nt).forEach(e)}add(...e){var t,i;e.forEach(a=>{this.contains(a)||K(this,nt).push(a)}),!(this.value===""&&!((t=K(this,Wr))!=null&&t.hasAttribute(`${K(this,Fr)}`)))&&((i=K(this,Wr))==null||i.setAttribute(`${K(this,Fr)}`,`${this.value}`))}remove(...e){var t;e.forEach(i=>{K(this,nt).splice(K(this,nt).indexOf(i),1)}),(t=K(this,Wr))==null||t.setAttribute(`${K(this,Fr)}`,`${this.value}`)}contains(e){return K(this,nt).includes(e)}toggle(e,t){return typeof t!="undefined"?t?(this.add(e),!0):(this.remove(e),!1):this.contains(e)?(this.remove(e),!1):(this.add(e),!0)}replace(e,t){this.remove(e),this.add(t)}};Wr=new WeakMap,Fr=new WeakMap,nt=new WeakMap;var K_=`[mux-player ${F_()}]`;function xi(...e){console.warn(K_,...e)}function st(...e){console.error(K_,...e)}function $_(e){var t;let i=(t=e.message)!=null?t:"";e.context&&(i+=` ${e.context}`),e.file&&(i+=` ${O("Read more: ")}
https://github.com/muxinc/elements/blob/main/errors/${e.file}`),xi(i)}var Ye={AUTOPLAY:"autoplay",CROSSORIGIN:"crossorigin",LOOP:"loop",MUTED:"muted",PLAYSINLINE:"playsinline",PRELOAD:"preload"},oa={VOLUME:"volume",PLAYBACKRATE:"playbackrate",MUTED:"muted"},OS=U(U({},Ye),oa),V_=Object.freeze({length:0,start(e){let t=e>>>0;if(t>=this.length)throw new DOMException(`Failed to execute 'start' on 'TimeRanges': The index provided (${t}) is greater than or equal to the maximum bound (${this.length}).`);return 0},end(e){let t=e>>>0;if(t>=this.length)throw new DOMException(`Failed to execute 'end' on 'TimeRanges': The index provided (${t}) is greater than or equal to the maximum bound (${this.length}).`);return 0}}),ok=Object.values(Ye).filter(e=>Ye.PLAYSINLINE!==e),lk=Object.values(oa),dk=[...ok,...lk],uk=class extends mi.HTMLElement{static get observedAttributes(){return dk}constructor(){super()}attributeChangedCallback(e,t,i){var a,r;switch(e){case oa.MUTED:{this.media&&(this.media.muted=i!=null,this.media.defaultMuted=i!=null);return}case oa.VOLUME:{let n=(a=Ge(i))!=null?a:1;this.media&&(this.media.volume=n);return}case oa.PLAYBACKRATE:{let n=(r=Ge(i))!=null?r:1;this.media&&(this.media.playbackRate=n,this.media.defaultPlaybackRate=n);return}}}play(){var e,t;return(t=(e=this.media)==null?void 0:e.play())!=null?t:Promise.reject()}pause(){var e;(e=this.media)==null||e.pause()}load(){var e;(e=this.media)==null||e.load()}get media(){var e;return(e=this.shadowRoot)==null?void 0:e.querySelector("mux-video")}get audioTracks(){return this.media.audioTracks}get videoTracks(){return this.media.videoTracks}get audioRenditions(){return this.media.audioRenditions}get videoRenditions(){return this.media.videoRenditions}get paused(){var e,t;return(t=(e=this.media)==null?void 0:e.paused)!=null?t:!0}get duration(){var e,t;return(t=(e=this.media)==null?void 0:e.duration)!=null?t:NaN}get ended(){var e,t;return(t=(e=this.media)==null?void 0:e.ended)!=null?t:!1}get buffered(){var e,t;return(t=(e=this.media)==null?void 0:e.buffered)!=null?t:V_}get seekable(){var e,t;return(t=(e=this.media)==null?void 0:e.seekable)!=null?t:V_}get readyState(){var e,t;return(t=(e=this.media)==null?void 0:e.readyState)!=null?t:0}get videoWidth(){var e,t;return(t=(e=this.media)==null?void 0:e.videoWidth)!=null?t:0}get videoHeight(){var e,t;return(t=(e=this.media)==null?void 0:e.videoHeight)!=null?t:0}get currentSrc(){var e,t;return(t=(e=this.media)==null?void 0:e.currentSrc)!=null?t:""}get currentTime(){var e,t;return(t=(e=this.media)==null?void 0:e.currentTime)!=null?t:0}set currentTime(e){this.media&&(this.media.currentTime=Number(e))}get volume(){var e,t;return(t=(e=this.media)==null?void 0:e.volume)!=null?t:1}set volume(e){this.media&&(this.media.volume=Number(e))}get playbackRate(){var e,t;return(t=(e=this.media)==null?void 0:e.playbackRate)!=null?t:1}set playbackRate(e){this.media&&(this.media.playbackRate=Number(e))}get defaultPlaybackRate(){var e;return(e=Ge(this.getAttribute(oa.PLAYBACKRATE)))!=null?e:1}set defaultPlaybackRate(e){e!=null?this.setAttribute(oa.PLAYBACKRATE,`${e}`):this.removeAttribute(oa.PLAYBACKRATE)}get crossOrigin(){return as(this,Ye.CROSSORIGIN)}set crossOrigin(e){this.setAttribute(Ye.CROSSORIGIN,`${e}`)}get autoplay(){return as(this,Ye.AUTOPLAY)!=null}set autoplay(e){e?this.setAttribute(Ye.AUTOPLAY,typeof e=="string"?e:""):this.removeAttribute(Ye.AUTOPLAY)}get loop(){return as(this,Ye.LOOP)!=null}set loop(e){e?this.setAttribute(Ye.LOOP,""):this.removeAttribute(Ye.LOOP)}get muted(){var e,t;return(t=(e=this.media)==null?void 0:e.muted)!=null?t:!1}set muted(e){this.media&&(this.media.muted=!!e)}get defaultMuted(){return as(this,Ye.MUTED)!=null}set defaultMuted(e){e?this.setAttribute(Ye.MUTED,""):this.removeAttribute(Ye.MUTED)}get playsInline(){return as(this,Ye.PLAYSINLINE)!=null}set playsInline(e){st("playsInline is set to true by default and is not currently supported as a setter.")}get preload(){return this.media?this.media.preload:this.getAttribute("preload")}set preload(e){["","none","metadata","auto"].includes(e)?this.setAttribute(Ye.PRELOAD,e):this.removeAttribute(Ye.PRELOAD)}};function as(e,t){return e.media?e.media.getAttribute(t):e.getAttribute(t)}var q_=uk,ck=`:host {
  --media-control-display: var(--controls);
  --media-loading-indicator-display: var(--loading-indicator);
  --media-dialog-display: var(--dialog);
  --media-play-button-display: var(--play-button);
  --media-live-button-display: var(--live-button);
  --media-seek-backward-button-display: var(--seek-backward-button);
  --media-seek-forward-button-display: var(--seek-forward-button);
  --media-mute-button-display: var(--mute-button);
  --media-captions-button-display: var(--captions-button);
  --media-captions-menu-button-display: var(--captions-menu-button, var(--media-captions-button-display));
  --media-rendition-menu-button-display: var(--rendition-menu-button);
  --media-audio-track-menu-button-display: var(--audio-track-menu-button);
  --media-airplay-button-display: var(--airplay-button);
  --media-pip-button-display: var(--pip-button);
  --media-fullscreen-button-display: var(--fullscreen-button);
  --media-cast-button-display: var(--cast-button, var(--_cast-button-drm-display));
  --media-playback-rate-button-display: var(--playback-rate-button);
  --media-playback-rate-menu-button-display: var(--playback-rate-menu-button);
  --media-volume-range-display: var(--volume-range);
  --media-time-range-display: var(--time-range);
  --media-time-display-display: var(--time-display);
  --media-duration-display-display: var(--duration-display);
  --media-title-display-display: var(--title-display);

  display: inline-block;
  line-height: 0;
  width: 100%;
}

a {
  color: #fff;
  font-size: 0.9em;
  text-decoration: underline;
}

media-theme {
  display: inline-block;
  line-height: 0;
  width: 100%;
  height: 100%;
  direction: ltr;
}

media-poster-image {
  display: inline-block;
  line-height: 0;
  width: 100%;
  height: 100%;
}

media-poster-image:not([src]):not([placeholdersrc]) {
  display: none;
}

::part(top),
[part~='top'] {
  --media-control-display: var(--controls, var(--top-controls));
  --media-play-button-display: var(--play-button, var(--top-play-button));
  --media-live-button-display: var(--live-button, var(--top-live-button));
  --media-seek-backward-button-display: var(--seek-backward-button, var(--top-seek-backward-button));
  --media-seek-forward-button-display: var(--seek-forward-button, var(--top-seek-forward-button));
  --media-mute-button-display: var(--mute-button, var(--top-mute-button));
  --media-captions-button-display: var(--captions-button, var(--top-captions-button));
  --media-captions-menu-button-display: var(
    --captions-menu-button,
    var(--media-captions-button-display, var(--top-captions-menu-button))
  );
  --media-rendition-menu-button-display: var(--rendition-menu-button, var(--top-rendition-menu-button));
  --media-audio-track-menu-button-display: var(--audio-track-menu-button, var(--top-audio-track-menu-button));
  --media-airplay-button-display: var(--airplay-button, var(--top-airplay-button));
  --media-pip-button-display: var(--pip-button, var(--top-pip-button));
  --media-fullscreen-button-display: var(--fullscreen-button, var(--top-fullscreen-button));
  --media-cast-button-display: var(--cast-button, var(--top-cast-button, var(--_cast-button-drm-display)));
  --media-playback-rate-button-display: var(--playback-rate-button, var(--top-playback-rate-button));
  --media-playback-rate-menu-button-display: var(
    --captions-menu-button,
    var(--media-playback-rate-button-display, var(--top-playback-rate-menu-button))
  );
  --media-volume-range-display: var(--volume-range, var(--top-volume-range));
  --media-time-range-display: var(--time-range, var(--top-time-range));
  --media-time-display-display: var(--time-display, var(--top-time-display));
  --media-duration-display-display: var(--duration-display, var(--top-duration-display));
  --media-title-display-display: var(--title-display, var(--top-title-display));
}

::part(center),
[part~='center'] {
  --media-control-display: var(--controls, var(--center-controls));
  --media-play-button-display: var(--play-button, var(--center-play-button));
  --media-live-button-display: var(--live-button, var(--center-live-button));
  --media-seek-backward-button-display: var(--seek-backward-button, var(--center-seek-backward-button));
  --media-seek-forward-button-display: var(--seek-forward-button, var(--center-seek-forward-button));
  --media-mute-button-display: var(--mute-button, var(--center-mute-button));
  --media-captions-button-display: var(--captions-button, var(--center-captions-button));
  --media-captions-menu-button-display: var(
    --captions-menu-button,
    var(--media-captions-button-display, var(--center-captions-menu-button))
  );
  --media-rendition-menu-button-display: var(--rendition-menu-button, var(--center-rendition-menu-button));
  --media-audio-track-menu-button-display: var(--audio-track-menu-button, var(--center-audio-track-menu-button));
  --media-airplay-button-display: var(--airplay-button, var(--center-airplay-button));
  --media-pip-button-display: var(--pip-button, var(--center-pip-button));
  --media-fullscreen-button-display: var(--fullscreen-button, var(--center-fullscreen-button));
  --media-cast-button-display: var(--cast-button, var(--center-cast-button, var(--_cast-button-drm-display)));
  --media-playback-rate-button-display: var(--playback-rate-button, var(--center-playback-rate-button));
  --media-playback-rate-menu-button-display: var(
    --playback-rate-menu-button,
    var(--media-playback-rate-button-display, var(--center-playback-rate-menu-button))
  );
  --media-volume-range-display: var(--volume-range, var(--center-volume-range));
  --media-time-range-display: var(--time-range, var(--center-time-range));
  --media-time-display-display: var(--time-display, var(--center-time-display));
  --media-duration-display-display: var(--duration-display, var(--center-duration-display));
}

::part(bottom),
[part~='bottom'] {
  --media-control-display: var(--controls, var(--bottom-controls));
  --media-play-button-display: var(--play-button, var(--bottom-play-button));
  --media-live-button-display: var(--live-button, var(--bottom-live-button));
  --media-seek-backward-button-display: var(--seek-backward-button, var(--bottom-seek-backward-button));
  --media-seek-forward-button-display: var(--seek-forward-button, var(--bottom-seek-forward-button));
  --media-mute-button-display: var(--mute-button, var(--bottom-mute-button));
  --media-captions-button-display: var(--captions-button, var(--bottom-captions-button));
  --media-captions-menu-button-display: var(
    --captions-menu-button,
    var(--media-captions-button-display, var(--bottom-captions-menu-button))
  );
  --media-rendition-menu-button-display: var(--rendition-menu-button, var(--bottom-rendition-menu-button));
  --media-audio-track-menu-button-display: var(--audio-track-menu-button, var(--bottom-audio-track-menu-button));
  --media-airplay-button-display: var(--airplay-button, var(--bottom-airplay-button));
  --media-pip-button-display: var(--pip-button, var(--bottom-pip-button));
  --media-fullscreen-button-display: var(--fullscreen-button, var(--bottom-fullscreen-button));
  --media-cast-button-display: var(--cast-button, var(--bottom-cast-button, var(--_cast-button-drm-display)));
  --media-playback-rate-button-display: var(--playback-rate-button, var(--bottom-playback-rate-button));
  --media-playback-rate-menu-button-display: var(
    --playback-rate-menu-button,
    var(--media-playback-rate-button-display, var(--bottom-playback-rate-menu-button))
  );
  --media-volume-range-display: var(--volume-range, var(--bottom-volume-range));
  --media-time-range-display: var(--time-range, var(--bottom-time-range));
  --media-time-display-display: var(--time-display, var(--bottom-time-display));
  --media-duration-display-display: var(--duration-display, var(--bottom-duration-display));
  --media-title-display-display: var(--title-display, var(--bottom-title-display));
}

:host([no-tooltips]) {
  --media-tooltip-display: none;
}
`,rs=new WeakMap,hk=class Ff{constructor(t,i){this.element=t,this.type=i,this.element.addEventListener(this.type,this);let a=rs.get(this.element);a&&a.set(this.type,this)}set(t){if(typeof t=="function")this.handleEvent=t.bind(this.element);else if(typeof t=="object"&&typeof t.handleEvent=="function")this.handleEvent=t.handleEvent.bind(t);else{this.element.removeEventListener(this.type,this);let i=rs.get(this.element);i&&i.delete(this.type)}}static for(t){rs.has(t.element)||rs.set(t.element,new Map);let i=t.attributeName.slice(2),a=rs.get(t.element);return a&&a.has(i)?a.get(i):new Ff(t.element,i)}};function mk(e,t){return e instanceof Wt&&e.attributeName.startsWith("on")?(hk.for(e).set(t),e.element.removeAttributeNS(e.attributeNamespace,e.attributeName),!0):!1}function pk(e,t){return t instanceof z_&&e instanceof Tr?(t.renderInto(e),!0):!1}function vk(e,t){return t instanceof DocumentFragment&&e instanceof Tr?(t.childNodes.length&&e.replace(...t.childNodes),!0):!1}function _k(e,t){if(e instanceof Wt){let i=e.attributeNamespace,a=e.element.getAttributeNS(i,e.attributeName);return String(t)!==a&&(e.value=String(t)),!0}return e.value=String(t),!0}function fk(e,t){if(e instanceof Wt&&t instanceof Element){let i=e.element;return i[e.attributeName]!==t&&(e.element.removeAttributeNS(e.attributeNamespace,e.attributeName),i[e.attributeName]=t),!0}return!1}function Ek(e,t){if(typeof t=="boolean"&&e instanceof Wt){let i=e.attributeNamespace,a=e.element.hasAttributeNS(i,e.attributeName);return t!==a&&(e.booleanValue=t),!0}return!1}function bk(e,t){return t===!1&&e instanceof Tr?(e.replace(""),!0):!1}function gk(e,t){fk(e,t)||Ek(e,t)||mk(e,t)||bk(e,t)||pk(e,t)||vk(e,t)||_k(e,t)}var fh=new Map,Y_=new WeakMap,G_=new WeakMap,z_=class{constructor(e,t,i){this.strings=e,this.values=t,this.processor=i,this.stringsKey=this.strings.join("")}get template(){if(fh.has(this.stringsKey))return fh.get(this.stringsKey);{let e=Kl.createElement("template"),t=this.strings.length-1;return e.innerHTML=this.strings.reduce((i,a,r)=>i+a+(r<t?`{{ ${r} }}`:""),""),fh.set(this.stringsKey,e),e}}renderInto(e){var t;let i=this.template;if(Y_.get(e)!==i){Y_.set(e,i);let r=new rl(i,this.values,this.processor);G_.set(e,r),e instanceof Tr?e.replace(...r.children):e.appendChild(r);return}let a=G_.get(e);(t=a==null?void 0:a.update)==null||t.call(a,this.values)}},yk={processCallback(e,t,i){var a;if(i){for(let[r,n]of t)if(r in i){let s=(a=i[r])!=null?a:"";gk(n,s)}}}};function $l(e,...t){return new z_(e,t,yk)}function Tk(e,t){e.renderInto(t)}var Ak=e=>{let{tokens:t}=e;return t.drm?":host(:not([cast-receiver])) { --_cast-button-drm-display: none; }":""},kk=e=>$l`
  <style>
    ${Ak(e)}
    ${ck}
  </style>
  ${Rk(e)}
`,wk=e=>{let t=e.hotKeys?`${e.hotKeys}`:"";return _h(e.streamType)==="live"&&(t+=" noarrowleft noarrowright"),t},Sk={TOP:"top",CENTER:"center",BOTTOM:"bottom",LAYER:"layer",MEDIA_LAYER:"media-layer",POSTER_LAYER:"poster-layer",VERTICAL_LAYER:"vertical-layer",CENTERED_LAYER:"centered-layer",GESTURE_LAYER:"gesture-layer",CONTROLLER_LAYER:"controller",BUTTON:"button",RANGE:"range",THUMB:"thumb",DISPLAY:"display",CONTROL_BAR:"control-bar",MENU_BUTTON:"menu-button",MENU:"menu",MENU_ITEM:"menu-item",OPTION:"option",POSTER:"poster",LIVE:"live",PLAY:"play",PRE_PLAY:"pre-play",SEEK_BACKWARD:"seek-backward",SEEK_FORWARD:"seek-forward",MUTE:"mute",CAPTIONS:"captions",AIRPLAY:"airplay",PIP:"pip",FULLSCREEN:"fullscreen",CAST:"cast",PLAYBACK_RATE:"playback-rate",VOLUME:"volume",TIME:"time",TITLE:"title",AUDIO_TRACK:"audio-track",RENDITION:"rendition"},Ik=Object.values(Sk).join(", "),Rk=e=>{var t,i,a,r,n,s,o,l,c,p,v,d,u,m,_,y,g,A,E,T,L,I,S,H,G,ne,z,V,ze,ht,mt,De,ot,et,Kt,$t,pt,Be,Qe,tt,Pi,Ba;return $l`
  <media-theme
    template="${e.themeTemplate||!1}"
    defaultstreamtype="${(t=e.defaultStreamType)!=null?t:!1}"
    hotkeys="${wk(e)||!1}"
    nohotkeys="${e.noHotKeys||!e.hasSrc||!1}"
    noautoseektolive="${!!((i=e.streamType)!=null&&i.includes(se.LIVE))&&e.targetLiveWindow!==0}"
    novolumepref="${e.novolumepref||!1}"
    nomutedpref="${e.nomutedpref||!1}"
    disabled="${!e.hasSrc||e.isDialogOpen}"
    audio="${(a=e.audio)!=null?a:!1}"
    style="${(r=XA({"--media-primary-color":e.primaryColor,"--media-secondary-color":e.secondaryColor,"--media-accent-color":e.accentColor}))!=null?r:!1}"
    defaultsubtitles="${!e.defaultHiddenCaptions}"
    forwardseekoffset="${(n=e.forwardSeekOffset)!=null?n:!1}"
    backwardseekoffset="${(s=e.backwardSeekOffset)!=null?s:!1}"
    playbackrates="${(o=e.playbackRates)!=null?o:!1}"
    defaultshowremainingtime="${(l=e.defaultShowRemainingTime)!=null?l:!1}"
    defaultduration="${(c=e.defaultDuration)!=null?c:!1}"
    hideduration="${(p=e.hideDuration)!=null?p:!1}"
    title="${(v=e.title)!=null?v:!1}"
    videotitle="${(d=e.videoTitle)!=null?d:!1}"
    proudlydisplaymuxbadge="${(u=e.proudlyDisplayMuxBadge)!=null?u:!1}"
    exportparts="${Ik}"
  >
    <mux-video
      slot="media"
      inert="${(m=e.noHotKeys)!=null?m:!1}"
      target-live-window="${(_=e.targetLiveWindow)!=null?_:!1}"
      stream-type="${(y=_h(e.streamType))!=null?y:!1}"
      crossorigin="${(g=e.crossOrigin)!=null?g:""}"
      playsinline
      autoplay="${(A=e.autoplay)!=null?A:!1}"
      muted="${(E=e.muted)!=null?E:!1}"
      loop="${(T=e.loop)!=null?T:!1}"
      preload="${(L=e.preload)!=null?L:!1}"
      debug="${(I=e.debug)!=null?I:!1}"
      prefer-cmcd="${(S=e.preferCmcd)!=null?S:!1}"
      disable-tracking="${(H=e.disableTracking)!=null?H:!1}"
      disable-cookies="${(G=e.disableCookies)!=null?G:!1}"
      prefer-playback="${(ne=e.preferPlayback)!=null?ne:!1}"
      start-time="${e.startTime!=null?e.startTime:!1}"
      initial-bandwidth-estimate-kbps="${e.initialBandwidthEstimateKbps!=null?e.initialBandwidthEstimateKbps:!1}"
      initial-estimate-segments="${e.initialEstimateSegments!=null?e.initialEstimateSegments:!1}"
      min-preload-segments="${e.minPreloadSegments!=null?e.minPreloadSegments:!1}"
      beacon-collection-domain="${(z=e.beaconCollectionDomain)!=null?z:!1}"
      player-init-time="${(V=e.playerInitTime)!=null?V:!1}"
      player-software-name="${(ze=e.playerSoftwareName)!=null?ze:!1}"
      player-software-version="${(ht=e.playerSoftwareVersion)!=null?ht:!1}"
      env-key="${(mt=e.envKey)!=null?mt:!1}"
      custom-domain="${(De=e.customDomain)!=null?De:!1}"
      src="${e.src?e.src:e.playbackId?Pd(e):!1}"
      cast-src="${e.src?e.src:e.playbackId?Pd(e):!1}"
      cast-receiver="${(ot=e.castReceiver)!=null?ot:!1}"
      drm-token="${(Kt=(et=e.tokens)==null?void 0:et.drm)!=null?Kt:!1}"
      playback-token="${(pt=($t=e.tokens)==null?void 0:$t.playback)!=null?pt:!1}"
      exportparts="video"
      disable-pseudo-ended="${(Be=e.disablePseudoEnded)!=null?Be:!1}"
      max-reconnect-retries="${(Qe=e.maxReconnectRetries)!=null?Qe:!1}"
      max-auto-resolution="${(tt=e.maxAutoResolution)!=null?tt:!1}"
      cap-rendition-to-player-size="${(Pi=e.capRenditionToPlayerSize)!=null?Pi:!1}"
    >
      ${e.storyboard?$l`<track label="thumbnails" default kind="metadata" src="${e.storyboard}" />`:$l``}
      <slot></slot>
    </mux-video>
    <slot name="poster" slot="poster">
      <media-poster-image
        part="poster"
        exportparts="poster, img"
        src="${e.poster?e.poster:!1}"
        placeholdersrc="${(Ba=e.placeholder)!=null?Ba:!1}"
      ></media-poster-image>
    </slot>
  </media-theme>
`},Q_=e=>e.charAt(0).toUpperCase()+e.slice(1),Lk=(e,t=!1)=>{var i,a;if(e.muxCode){let r=Q_((i=e.errorCategory)!=null?i:"video"),n=ys((a=e.errorCategory)!=null?a:re.VIDEO);if(e.muxCode===N.NETWORK_OFFLINE)return O("Your device appears to be offline",t);if(e.muxCode===N.NETWORK_RECONNECTING)return O("Reconnecting...",t);if(e.muxCode===N.NETWORK_TOKEN_EXPIRED)return O("{category} URL has expired",t).format({category:r});if([N.NETWORK_TOKEN_SUB_MISMATCH,N.NETWORK_TOKEN_AUD_MISMATCH,N.NETWORK_TOKEN_AUD_MISSING,N.NETWORK_TOKEN_MALFORMED].includes(e.muxCode))return O("{category} URL is formatted incorrectly",t).format({category:r});if(e.muxCode===N.NETWORK_TOKEN_MISSING)return O("Invalid {categoryName} URL",t).format({categoryName:n});if(e.muxCode===N.NETWORK_NOT_FOUND)return O("{category} does not exist",t).format({category:r});if(e.muxCode===N.NETWORK_NOT_READY){let s=e.streamType==="live"?"Live stream":"Video";return O("{mediaType} is not currently available",t).format({mediaType:s})}}if(e.code){if(e.code===M.MEDIA_ERR_NETWORK)return O("Network Error",t);if(e.code===M.MEDIA_ERR_DECODE)return O("Media Error",t);if(e.code===M.MEDIA_ERR_SRC_NOT_SUPPORTED)return O("Source Not Supported",t)}return O("Error",t)},Ck=(e,t=!1)=>{var i,a;if(e.reload)return'Try again later or <a href="#" data-mux-reload style="color: #4a90e2;">click here to retry</a>';if(e.muxCode){let r=Q_((i=e.errorCategory)!=null?i:"video"),n=ys((a=e.errorCategory)!=null?a:re.VIDEO);return e.muxCode===N.NETWORK_OFFLINE?O("Check your internet connection and try reloading this video.",t):e.muxCode===N.NETWORK_RECONNECTING?O("Your connection was interrupted. Attempting to resume playback...",t):e.muxCode===N.NETWORK_TOKEN_EXPIRED?O("The video\u2019s secured {tokenNamePrefix}-token has expired.",t).format({tokenNamePrefix:n}):e.muxCode===N.NETWORK_TOKEN_SUB_MISMATCH?O("The video\u2019s playback ID does not match the one encoded in the {tokenNamePrefix}-token.",t).format({tokenNamePrefix:n}):e.muxCode===N.NETWORK_TOKEN_MALFORMED?O("{category} URL is formatted incorrectly",t).format({category:r}):[N.NETWORK_TOKEN_AUD_MISMATCH,N.NETWORK_TOKEN_AUD_MISSING].includes(e.muxCode)?O("The {tokenNamePrefix}-token is formatted with incorrect information.",t).format({tokenNamePrefix:n}):[N.NETWORK_TOKEN_MISSING,N.NETWORK_INVALID_URL].includes(e.muxCode)?O("The video URL or {tokenNamePrefix}-token are formatted with incorrect or incomplete information.",t).format({tokenNamePrefix:n}):e.muxCode===N.NETWORK_NOT_FOUND?"":e.message}return e.code&&(e.code===M.MEDIA_ERR_NETWORK||e.code===M.MEDIA_ERR_DECODE||(e.code,M.MEDIA_ERR_SRC_NOT_SUPPORTED)),e.message},Mk=(e,t=!1)=>{let i=Lk(e,t).toString(),a=Ck(e,t).toString();return{title:i,message:a}},Dk=e=>{if(e.muxCode){if(e.muxCode===N.NETWORK_TOKEN_EXPIRED)return"403-expired-token.md";if(e.muxCode===N.NETWORK_TOKEN_MALFORMED)return"403-malformatted-token.md";if([N.NETWORK_TOKEN_AUD_MISMATCH,N.NETWORK_TOKEN_AUD_MISSING].includes(e.muxCode))return"403-incorrect-aud-value.md";if(e.muxCode===N.NETWORK_TOKEN_SUB_MISMATCH)return"403-playback-id-mismatch.md";if(e.muxCode===N.NETWORK_TOKEN_MISSING)return"missing-signed-tokens.md";if(e.muxCode===N.NETWORK_NOT_FOUND)return"404-not-found.md";if(e.muxCode===N.NETWORK_NOT_READY)return"412-not-playable.md"}if(e.code){if(e.code===M.MEDIA_ERR_NETWORK)return"";if(e.code===M.MEDIA_ERR_DECODE)return"media-decode-error.md";if(e.code===M.MEDIA_ERR_SRC_NOT_SUPPORTED)return"media-src-not-supported.md"}return""},Z_=(e,t)=>{let i=Dk(e);return{message:e.message,context:e.context,file:i}},xk=`<template id="media-theme-gerwig">
  <style>
    @keyframes pre-play-hide {
      0% {
        transform: scale(1);
        opacity: 1;
      }

      30% {
        transform: scale(0.7);
      }

      100% {
        transform: scale(1.5);
        opacity: 0;
      }
    }

    :host {
      --_primary-color: var(--media-primary-color, #fff);
      --_secondary-color: var(--media-secondary-color, transparent);
      --_accent-color: var(--media-accent-color, #fa50b5);
      --_text-color: var(--media-text-color, #000);

      --media-icon-color: var(--_primary-color);
      --media-control-background: var(--_secondary-color);
      --media-control-hover-background: var(--_accent-color);
      --media-time-buffered-color: rgba(255, 255, 255, 0.4);
      --media-preview-time-text-shadow: none;
      --media-control-height: 14px;
      --media-control-padding: 6px;
      --media-tooltip-container-margin: 6px;
      --media-tooltip-distance: 18px;

      color: var(--_primary-color);
      display: inline-block;
      width: 100%;
      height: 100%;
    }

    :host([audio]) {
      --_secondary-color: var(--media-secondary-color, black);
      --media-preview-time-text-shadow: none;
    }

    :host([audio]) ::slotted([slot='media']) {
      height: 0px;
    }

    :host([audio]) media-loading-indicator {
      display: none;
    }

    :host([audio]) media-controller {
      background: transparent;
    }

    :host([audio]) media-controller::part(vertical-layer) {
      background: transparent;
    }

    :host([audio]) media-control-bar {
      width: 100%;
      background-color: var(--media-control-background);
    }

    /*
     * 0.433s is the transition duration for VTT Regions.
     * Borrowed here, so the captions don't move too fast.
     */
    media-controller {
      --media-webkit-text-track-transform: translateY(0) scale(0.98);
      --media-webkit-text-track-transition: transform 0.433s ease-out 0.3s;
    }
    media-controller:is([mediapaused], :not([userinactive])) {
      --media-webkit-text-track-transform: translateY(-50px) scale(0.98);
      --media-webkit-text-track-transition: transform 0.15s ease;
    }

    /*
     * CSS specific to iOS devices.
     * See: https://stackoverflow.com/questions/30102792/css-media-query-to-target-only-ios-devices/60220757#60220757
     */
    @supports (-webkit-touch-callout: none) {
      /* Disable subtitle adjusting for iOS Safari */
      media-controller[mediaisfullscreen] {
        --media-webkit-text-track-transform: unset;
        --media-webkit-text-track-transition: unset;
      }
    }

    media-time-range {
      --media-box-padding-left: 6px;
      --media-box-padding-right: 6px;
      --media-range-bar-color: var(--_accent-color);
      --media-time-range-buffered-color: var(--_primary-color);
      --media-range-track-color: transparent;
      --media-range-track-background: rgba(255, 255, 255, 0.4);
      --media-range-thumb-background: radial-gradient(
        circle,
        #000 0%,
        #000 25%,
        var(--_accent-color) 25%,
        var(--_accent-color)
      );
      --media-range-thumb-width: 12px;
      --media-range-thumb-height: 12px;
      --media-range-thumb-transform: scale(0);
      --media-range-thumb-transition: transform 0.3s;
      --media-range-thumb-opacity: 1;
      --media-preview-background: var(--_primary-color);
      --media-box-arrow-background: var(--_primary-color);
      --media-preview-thumbnail-border: 5px solid var(--_primary-color);
      --media-preview-border-radius: 5px;
      --media-text-color: var(--_text-color);
      --media-control-hover-background: transparent;
      --media-preview-chapter-text-shadow: none;
      color: var(--_accent-color);
      padding: 0 6px;
    }

    :host([audio]) media-time-range {
      --media-preview-time-padding: 1.5px 6px;
      --media-preview-box-margin: 0 0 -5px;
    }

    media-time-range:hover {
      --media-range-thumb-transform: scale(1);
    }

    media-preview-thumbnail {
      border-bottom-width: 0;
    }

    [part~='menu'] {
      border-radius: 2px;
      border: 1px solid rgba(0, 0, 0, 0.1);
      bottom: 50px;
      padding: 2.5px 10px;
    }

    [part~='menu']::part(indicator) {
      fill: var(--_accent-color);
    }

    [part~='menu']::part(menu-item) {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      padding: 6px 10px;
      min-height: 34px;
    }

    [part~='menu']::part(checked) {
      font-weight: 700;
    }

    media-captions-menu,
    media-rendition-menu,
    media-audio-track-menu,
    media-playback-rate-menu {
      position: absolute; /* ensure they don't take up space in DOM on load */
      --media-menu-background: var(--_primary-color);
      --media-menu-item-checked-background: transparent;
      --media-text-color: var(--_text-color);
      --media-menu-item-hover-background: transparent;
      --media-menu-item-hover-outline: var(--_accent-color) solid 1px;
    }

    media-rendition-menu {
      min-width: 140px;
    }

    /* The icon is a circle so make it 16px high instead of 14px for more balance. */
    media-audio-track-menu-button {
      --media-control-padding: 5px;
      --media-control-height: 16px;
    }

    media-playback-rate-menu-button {
      --media-control-padding: 6px 3px;
      min-width: 4.4ch;
    }

    media-playback-rate-menu {
      --media-menu-flex-direction: row;
      --media-menu-item-checked-background: var(--_accent-color);
      --media-menu-item-checked-indicator-display: none;
      margin-right: 6px;
      padding: 0;
      --media-menu-gap: 0.25em;
    }

    media-playback-rate-menu[part~='menu']::part(menu-item) {
      padding: 6px 6px 6px 8px;
    }

    media-playback-rate-menu[part~='menu']::part(checked) {
      color: #fff;
    }

    :host(:not([audio])) media-time-range {
      /* Adding px is required here for calc() */
      --media-range-padding: 0px;
      background: transparent;
      z-index: 10;
      height: 10px;
      bottom: -3px;
      width: 100%;
    }

    media-control-bar :is([role='button'], [role='switch'], button) {
      line-height: 0;
    }

    media-control-bar :is([part*='button'], [part*='range'], [part*='display']) {
      border-radius: 3px;
    }

    .spacer {
      flex-grow: 1;
      background-color: var(--media-control-background, rgba(20, 20, 30, 0.7));
    }

    media-control-bar[slot~='top-chrome'] {
      min-height: 42px;
      pointer-events: none;
    }

    media-control-bar {
      --gradient-steps:
        hsl(0 0% 0% / 0) 0%, hsl(0 0% 0% / 0.013) 8.1%, hsl(0 0% 0% / 0.049) 15.5%, hsl(0 0% 0% / 0.104) 22.5%,
        hsl(0 0% 0% / 0.175) 29%, hsl(0 0% 0% / 0.259) 35.3%, hsl(0 0% 0% / 0.352) 41.2%, hsl(0 0% 0% / 0.45) 47.1%,
        hsl(0 0% 0% / 0.55) 52.9%, hsl(0 0% 0% / 0.648) 58.8%, hsl(0 0% 0% / 0.741) 64.7%, hsl(0 0% 0% / 0.825) 71%,
        hsl(0 0% 0% / 0.896) 77.5%, hsl(0 0% 0% / 0.951) 84.5%, hsl(0 0% 0% / 0.987) 91.9%, hsl(0 0% 0%) 100%;
    }

    :host([title]) media-control-bar[slot='top-chrome']::before,
    :host([videotitle]) media-control-bar[slot='top-chrome']::before {
      content: '';
      position: absolute;
      width: 100%;
      padding-bottom: min(100px, 25%);
      background: linear-gradient(to top, var(--gradient-steps));
      opacity: 0.8;
      pointer-events: none;
    }

    :host(:not([audio])) media-control-bar[part~='bottom']::before {
      content: '';
      position: absolute;
      width: 100%;
      bottom: 0;
      left: 0;
      padding-bottom: min(100px, 25%);
      background: linear-gradient(to bottom, var(--gradient-steps));
      opacity: 0.8;
      z-index: 1;
      pointer-events: none;
    }

    media-control-bar[part~='bottom'] > * {
      z-index: 20;
    }

    media-control-bar[part~='bottom'] {
      padding: 6px 6px;
    }

    media-control-bar[slot~='top-chrome'] > * {
      --media-control-background: transparent;
      --media-control-hover-background: transparent;
      position: relative;
    }

    media-controller::part(vertical-layer) {
      transition: background-color 1s;
    }

    media-controller:is([mediapaused], :not([userinactive]))::part(vertical-layer) {
      background-color: var(--controls-backdrop-color, var(--controls, transparent));
      transition: background-color 0.25s;
    }

    .center-controls {
      --media-button-icon-width: 100%;
      --media-button-icon-height: auto;
      --media-tooltip-display: none;
      pointer-events: none;
      width: 100%;
      display: flex;
      flex-flow: row;
      align-items: center;
      justify-content: center;
      paint-order: stroke;
      stroke: rgba(102, 102, 102, 1);
      stroke-width: 0.3px;
      text-shadow:
        0 0 2px rgb(0 0 0 / 0.25),
        0 0 6px rgb(0 0 0 / 0.25);
      filter: drop-shadow(0 0 2px rgb(0 0 0 / 0.25)) drop-shadow(0 0 6px rgb(0 0 0 / 0.25));
    }

    .center-controls media-play-button {
      --media-control-background: transparent;
      --media-control-hover-background: transparent;
      --media-control-padding: 0;
      width: 40px;
    }

    [breakpointsm] .center-controls media-play-button {
      width: 90px;
      height: 90px;
      border-radius: 50%;
      transition: background 0.4s;
      padding: 24px;
      --media-control-background: #000;
      --media-control-hover-background: var(--_accent-color);
    }

    .center-controls media-seek-backward-button,
    .center-controls media-seek-forward-button {
      --media-control-background: transparent;
      --media-control-hover-background: transparent;
      padding: 0;
      margin: 0 20px;
      width: max(33px, min(8%, 40px));
      text-shadow:
        0 0 2px rgb(0 0 0 / 0.25),
        0 0 6px rgb(0 0 0 / 0.25);
    }

    [breakpointsm]:not([audio]) .center-controls.pre-playback {
      display: grid;
      align-items: initial;
      justify-content: initial;
      height: 100%;
      overflow: hidden;
    }

    [breakpointsm]:not([audio]) .center-controls.pre-playback media-play-button {
      place-self: var(--_pre-playback-place, center);
      grid-area: 1 / 1;
      margin: 16px;
    }

    /* Show and hide controls or pre-playback state */

    [breakpointsm]:is([mediahasplayed], :not([mediapaused])):not([audio])
      .center-controls.pre-playback
      media-play-button {
      /* Using \`forwards\` would lead to a laggy UI after the animation got in the end state */
      animation: 0.3s linear pre-play-hide;
      opacity: 0;
      pointer-events: none;
    }

    .autoplay-unmute {
      --media-control-hover-background: transparent;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      filter: drop-shadow(0 0 2px rgb(0 0 0 / 0.25)) drop-shadow(0 0 6px rgb(0 0 0 / 0.25));
    }

    .autoplay-unmute-btn {
      --media-control-height: 16px;
      border-radius: 8px;
      background: #000;
      color: var(--_primary-color);
      display: flex;
      align-items: center;
      padding: 8px 16px;
      font-size: 18px;
      font-weight: 500;
      cursor: pointer;
    }

    .autoplay-unmute-btn:hover {
      background: var(--_accent-color);
    }

    [breakpointsm] .autoplay-unmute-btn {
      --media-control-height: 30px;
      padding: 14px 24px;
      font-size: 26px;
    }

    .autoplay-unmute-btn svg {
      margin: 0 6px 0 0;
    }

    [breakpointsm] .autoplay-unmute-btn svg {
      margin: 0 10px 0 0;
    }

    media-controller:not([audio]):not([mediahasplayed]) *:is(media-control-bar, media-time-range) {
      display: none;
    }

    media-error-dialog:not([mediaerrorcode]) {
      opacity: 0;
    }

    media-loading-indicator {
      --media-loading-icon-width: 100%;
      --media-button-icon-height: auto;
      display: var(--media-control-display, var(--media-loading-indicator-display, flex));
      pointer-events: none;
      position: absolute;
      width: min(15%, 150px);
      flex-flow: row;
      align-items: center;
      justify-content: center;
    }

    /* Intentionally don't target the div for transition but the children
     of the div. Prevents messing with media-chrome's autohide feature. */
    media-loading-indicator + div * {
      transition: opacity 0.15s;
      opacity: 1;
    }

    media-loading-indicator[medialoading]:not([mediapaused]) ~ div > * {
      opacity: 0;
      transition-delay: 400ms;
    }

    media-volume-range {
      width: min(100%, 100px);
      --media-range-padding-left: 10px;
      --media-range-padding-right: 10px;
      --media-range-thumb-width: 12px;
      --media-range-thumb-height: 12px;
      --media-range-thumb-background: radial-gradient(
        circle,
        #000 0%,
        #000 25%,
        var(--_primary-color) 25%,
        var(--_primary-color)
      );
      --media-control-hover-background: none;
    }

    media-time-display {
      white-space: nowrap;
    }

    /* Generic style for explicitly disabled controls */
    media-control-bar[part~='bottom'] [disabled],
    media-control-bar[part~='bottom'] [aria-disabled='true'] {
      opacity: 60%;
      cursor: not-allowed;
    }

    media-text-display {
      --media-font-size: 16px;
      --media-control-padding: 14px;
      font-weight: 500;
    }

    media-play-button.animated *:is(g, path) {
      transition: all 0.3s;
    }

    media-play-button.animated[mediapaused] .pause-icon-pt1 {
      opacity: 0;
    }

    media-play-button.animated[mediapaused] .pause-icon-pt2 {
      transform-origin: center center;
      transform: scaleY(0);
    }

    media-play-button.animated[mediapaused] .play-icon {
      clip-path: inset(0 0 0 0);
    }

    media-play-button.animated:not([mediapaused]) .play-icon {
      clip-path: inset(0 0 0 100%);
    }

    media-seek-forward-button,
    media-seek-backward-button {
      --media-font-weight: 400;
    }

    .mute-icon {
      display: inline-block;
    }

    .mute-icon :is(path, g) {
      transition: opacity 0.5s;
    }

    .muted {
      opacity: 0;
    }

    media-mute-button[mediavolumelevel='low'] :is(.volume-medium, .volume-high),
    media-mute-button[mediavolumelevel='medium'] :is(.volume-high) {
      opacity: 0;
    }

    media-mute-button[mediavolumelevel='off'] .unmuted {
      opacity: 0;
    }

    media-mute-button[mediavolumelevel='off'] .muted {
      opacity: 1;
    }

    /**
     * Our defaults for these buttons are to hide them at small sizes
     * users can override this with CSS
     */
    media-controller:not([breakpointsm]):not([audio]) {
      --bottom-play-button: none;
      --bottom-seek-backward-button: none;
      --bottom-seek-forward-button: none;
      --bottom-time-display: none;
      --bottom-playback-rate-menu-button: none;
      --bottom-pip-button: none;
    }

    [part='mux-badge'] {
      position: absolute;
      bottom: 10px;
      right: 10px;
      z-index: 2;
      opacity: 0.6;
      transition:
        opacity 0.2s ease-in-out,
        bottom 0.2s ease-in-out;
    }

    [part='mux-badge']:hover {
      opacity: 1;
    }

    [part='mux-badge'] a {
      font-size: 14px;
      font-family: var(--_font-family);
      color: var(--_primary-color);
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    [part='mux-badge'] .mux-badge-text {
      transition: opacity 0.5s ease-in-out;
      opacity: 0;
    }

    [part='mux-badge'] .mux-badge-logo {
      width: 40px;
      height: auto;
      display: inline-block;
    }

    [part='mux-badge'] .mux-badge-logo svg {
      width: 100%;
      height: 100%;
      fill: white;
    }

    media-controller:not([userinactive]):not([mediahasplayed]) [part='mux-badge'],
    media-controller:not([userinactive]) [part='mux-badge'],
    media-controller[mediahasplayed][mediapaused] [part='mux-badge'] {
      transition: bottom 0.1s ease-in-out;
    }

    media-controller[userinactive]:not([mediapaused]) [part='mux-badge'] {
      transition: bottom 0.2s ease-in-out 0.62s;
    }

    media-controller:not([userinactive]) [part='mux-badge'] .mux-badge-text,
    media-controller[mediahasplayed][mediapaused] [part='mux-badge'] .mux-badge-text {
      opacity: 1;
    }

    media-controller[userinactive]:not([mediapaused]) [part='mux-badge'] .mux-badge-text {
      opacity: 0;
    }

    media-controller[userinactive]:not([mediapaused]) [part='mux-badge'] {
      bottom: 10px;
    }

    media-controller:not([userinactive]):not([mediahasplayed]) [part='mux-badge'] {
      bottom: 10px;
    }

    media-controller:not([userinactive])[mediahasplayed] [part='mux-badge'],
    media-controller[mediahasplayed][mediapaused] [part='mux-badge'] {
      bottom: calc(28px + var(--media-control-height, 0px) + var(--media-control-padding, 0px) * 2);
    }
  </style>

  <template partial="TitleDisplay">
    <template if="videotitle">
      <template if="videotitle != true">
        <media-text-display part="top title display" class="title-display">{{videotitle}}</media-text-display>
      </template>
    </template>
    <template if="!videotitle">
      <template if="title">
        <media-text-display part="top title display" class="title-display">{{title}}</media-text-display>
      </template>
    </template>
  </template>

  <template partial="PlayButton">
    <media-play-button
      part="{{section ?? 'bottom'}} play button"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
      class="animated"
    >
      <svg aria-hidden="true" viewBox="0 0 18 14" slot="icon">
        <g class="play-icon">
          <path
            d="M15.5987 6.2911L3.45577 0.110898C2.83667 -0.204202 2.06287 0.189698 2.06287 0.819798V13.1802C2.06287 13.8103 2.83667 14.2042 3.45577 13.8891L15.5987 7.7089C16.2178 7.3938 16.2178 6.6061 15.5987 6.2911Z"
          />
        </g>
        <g class="pause-icon">
          <path
            class="pause-icon-pt1"
            d="M5.90709 0H2.96889C2.46857 0 2.06299 0.405585 2.06299 0.9059V13.0941C2.06299 13.5944 2.46857 14 2.96889 14H5.90709C6.4074 14 6.81299 13.5944 6.81299 13.0941V0.9059C6.81299 0.405585 6.4074 0 5.90709 0Z"
          />
          <path
            class="pause-icon-pt2"
            d="M15.1571 0H12.2189C11.7186 0 11.313 0.405585 11.313 0.9059V13.0941C11.313 13.5944 11.7186 14 12.2189 14H15.1571C15.6574 14 16.063 13.5944 16.063 13.0941V0.9059C16.063 0.405585 15.6574 0 15.1571 0Z"
          />
        </g>
      </svg>
    </media-play-button>
  </template>

  <template partial="PrePlayButton">
    <media-play-button
      part="{{section ?? 'center'}} play button pre-play"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    >
      <svg aria-hidden="true" viewBox="0 0 18 14" slot="icon" style="transform: translate(3px, 0)">
        <path
          d="M15.5987 6.2911L3.45577 0.110898C2.83667 -0.204202 2.06287 0.189698 2.06287 0.819798V13.1802C2.06287 13.8103 2.83667 14.2042 3.45577 13.8891L15.5987 7.7089C16.2178 7.3938 16.2178 6.6061 15.5987 6.2911Z"
        />
      </svg>
    </media-play-button>
  </template>

  <template partial="SeekBackwardButton">
    <media-seek-backward-button
      seekoffset="{{backwardseekoffset}}"
      part="{{section ?? 'bottom'}} seek-backward button"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    >
      <svg viewBox="0 0 22 14" aria-hidden="true" slot="icon">
        <path
          d="M3.65 2.07888L0.0864 6.7279C-0.0288 6.87812 -0.0288 7.12188 0.0864 7.2721L3.65 11.9211C3.7792 12.0896 4 11.9703 4 11.7321V2.26787C4 2.02968 3.7792 1.9104 3.65 2.07888Z"
        />
        <text transform="translate(6 12)" style="font-size: 14px; font-family: 'ArialMT', 'Arial'">
          {{backwardseekoffset}}
        </text>
      </svg>
    </media-seek-backward-button>
  </template>

  <template partial="SeekForwardButton">
    <media-seek-forward-button
      seekoffset="{{forwardseekoffset}}"
      part="{{section ?? 'bottom'}} seek-forward button"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    >
      <svg viewBox="0 0 22 14" aria-hidden="true" slot="icon">
        <g>
          <text transform="translate(-1 12)" style="font-size: 14px; font-family: 'ArialMT', 'Arial'">
            {{forwardseekoffset}}
          </text>
          <path
            d="M18.35 11.9211L21.9136 7.2721C22.0288 7.12188 22.0288 6.87812 21.9136 6.7279L18.35 2.07888C18.2208 1.91041 18 2.02968 18 2.26787V11.7321C18 11.9703 18.2208 12.0896 18.35 11.9211Z"
          />
        </g>
      </svg>
    </media-seek-forward-button>
  </template>

  <template partial="MuteButton">
    <media-mute-button part="bottom mute button" disabled="{{disabled}}" aria-disabled="{{disabled}}">
      <svg viewBox="0 0 18 14" slot="icon" class="mute-icon" aria-hidden="true">
        <g class="unmuted">
          <path
            d="M6.76786 1.21233L3.98606 3.98924H1.19937C0.593146 3.98924 0.101743 4.51375 0.101743 5.1607V6.96412L0 6.99998L0.101743 7.03583V8.83926C0.101743 9.48633 0.593146 10.0108 1.19937 10.0108H3.98606L6.76773 12.7877C7.23561 13.2547 8 12.9007 8 12.2171V1.78301C8 1.09925 7.23574 0.745258 6.76786 1.21233Z"
          />
          <path
            class="volume-low"
            d="M10 3.54781C10.7452 4.55141 11.1393 5.74511 11.1393 6.99991C11.1393 8.25471 10.7453 9.44791 10 10.4515L10.7988 11.0496C11.6734 9.87201 12.1356 8.47161 12.1356 6.99991C12.1356 5.52821 11.6735 4.12731 10.7988 2.94971L10 3.54781Z"
          />
          <path
            class="volume-medium"
            d="M12.3778 2.40086C13.2709 3.76756 13.7428 5.35806 13.7428 7.00026C13.7428 8.64246 13.2709 10.233 12.3778 11.5992L13.2106 12.1484C14.2107 10.6185 14.739 8.83796 14.739 7.00016C14.739 5.16236 14.2107 3.38236 13.2106 1.85156L12.3778 2.40086Z"
          />
          <path
            class="volume-high"
            d="M15.5981 0.75L14.7478 1.2719C15.7937 2.9919 16.3468 4.9723 16.3468 7C16.3468 9.0277 15.7937 11.0082 14.7478 12.7281L15.5981 13.25C16.7398 11.3722 17.343 9.211 17.343 7C17.343 4.789 16.7398 2.6268 15.5981 0.75Z"
          />
        </g>
        <g class="muted">
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M4.39976 4.98924H1.19937C1.19429 4.98924 1.17777 4.98961 1.15296 5.01609C1.1271 5.04369 1.10174 5.09245 1.10174 5.1607V8.83926C1.10174 8.90761 1.12714 8.95641 1.15299 8.984C1.17779 9.01047 1.1943 9.01084 1.19937 9.01084H4.39977L7 11.6066V2.39357L4.39976 4.98924ZM7.47434 1.92006C7.4743 1.9201 7.47439 1.92002 7.47434 1.92006V1.92006ZM6.76773 12.7877L3.98606 10.0108H1.19937C0.593146 10.0108 0.101743 9.48633 0.101743 8.83926V7.03583L0 6.99998L0.101743 6.96412V5.1607C0.101743 4.51375 0.593146 3.98924 1.19937 3.98924H3.98606L6.76786 1.21233C7.23574 0.745258 8 1.09925 8 1.78301V12.2171C8 12.9007 7.23561 13.2547 6.76773 12.7877Z"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M15.2677 9.30323C15.463 9.49849 15.7796 9.49849 15.9749 9.30323C16.1701 9.10796 16.1701 8.79138 15.9749 8.59612L14.2071 6.82841L15.9749 5.06066C16.1702 4.8654 16.1702 4.54882 15.9749 4.35355C15.7796 4.15829 15.4631 4.15829 15.2678 4.35355L13.5 6.1213L11.7322 4.35348C11.537 4.15822 11.2204 4.15822 11.0251 4.35348C10.8298 4.54874 10.8298 4.86532 11.0251 5.06058L12.7929 6.82841L11.0251 8.59619C10.8299 8.79146 10.8299 9.10804 11.0251 9.3033C11.2204 9.49856 11.537 9.49856 11.7323 9.3033L13.5 7.53552L15.2677 9.30323Z"
          />
        </g>
      </svg>
    </media-mute-button>
  </template>

  <template partial="PipButton">
    <media-pip-button part="bottom pip button" disabled="{{disabled}}" aria-disabled="{{disabled}}">
      <svg viewBox="0 0 18 14" aria-hidden="true" slot="icon">
        <path
          d="M15.9891 0H2.011C0.9004 0 0 0.9003 0 2.0109V11.989C0 13.0996 0.9004 14 2.011 14H15.9891C17.0997 14 18 13.0997 18 11.9891V2.0109C18 0.9003 17.0997 0 15.9891 0ZM17 11.9891C17 12.5465 16.5465 13 15.9891 13H2.011C1.4536 13 1.0001 12.5465 1.0001 11.9891V2.0109C1.0001 1.4535 1.4536 0.9999 2.011 0.9999H15.9891C16.5465 0.9999 17 1.4535 17 2.0109V11.9891Z"
        />
        <path
          d="M15.356 5.67822H8.19523C8.03253 5.67822 7.90063 5.81012 7.90063 5.97282V11.3836C7.90063 11.5463 8.03253 11.6782 8.19523 11.6782H15.356C15.5187 11.6782 15.6506 11.5463 15.6506 11.3836V5.97282C15.6506 5.81012 15.5187 5.67822 15.356 5.67822Z"
        />
      </svg>
    </media-pip-button>
  </template>

  <template partial="CaptionsMenu">
    <media-captions-menu-button part="bottom captions button">
      <svg aria-hidden="true" viewBox="0 0 18 14" slot="on">
        <path
          d="M15.989 0H2.011C0.9004 0 0 0.9003 0 2.0109V11.9891C0 13.0997 0.9004 14 2.011 14H15.989C17.0997 14 18 13.0997 18 11.9891V2.0109C18 0.9003 17.0997 0 15.989 0ZM4.2292 8.7639C4.5954 9.1902 5.0935 9.4031 5.7233 9.4031C6.1852 9.4031 6.5544 9.301 6.8302 9.0969C7.1061 8.8933 7.2863 8.614 7.3702 8.26H8.4322C8.3062 8.884 8.0093 9.3733 7.5411 9.7273C7.0733 10.0813 6.4703 10.2581 5.732 10.2581C5.108 10.2581 4.5699 10.1219 4.1168 9.8489C3.6637 9.5759 3.3141 9.1946 3.0685 8.7058C2.8224 8.2165 2.6994 7.6511 2.6994 7.009C2.6994 6.3611 2.8224 5.7927 3.0685 5.3034C3.3141 4.8146 3.6637 4.4323 4.1168 4.1559C4.5699 3.88 5.108 3.7418 5.732 3.7418C6.4703 3.7418 7.0733 3.922 7.5411 4.2818C8.0094 4.6422 8.3062 5.1461 8.4322 5.794H7.3702C7.2862 5.4283 7.106 5.1368 6.8302 4.921C6.5544 4.7052 6.1852 4.5968 5.7233 4.5968C5.0934 4.5968 4.5954 4.8116 4.2292 5.2404C3.8635 5.6696 3.6804 6.259 3.6804 7.009C3.6804 7.7531 3.8635 8.3381 4.2292 8.7639ZM11.0974 8.7639C11.4636 9.1902 11.9617 9.4031 12.5915 9.4031C13.0534 9.4031 13.4226 9.301 13.6984 9.0969C13.9743 8.8933 14.1545 8.614 14.2384 8.26H15.3004C15.1744 8.884 14.8775 9.3733 14.4093 9.7273C13.9415 10.0813 13.3385 10.2581 12.6002 10.2581C11.9762 10.2581 11.4381 10.1219 10.985 9.8489C10.5319 9.5759 10.1823 9.1946 9.9367 8.7058C9.6906 8.2165 9.5676 7.6511 9.5676 7.009C9.5676 6.3611 9.6906 5.7927 9.9367 5.3034C10.1823 4.8146 10.5319 4.4323 10.985 4.1559C11.4381 3.88 11.9762 3.7418 12.6002 3.7418C13.3385 3.7418 13.9415 3.922 14.4093 4.2818C14.8776 4.6422 15.1744 5.1461 15.3004 5.794H14.2384C14.1544 5.4283 13.9742 5.1368 13.6984 4.921C13.4226 4.7052 13.0534 4.5968 12.5915 4.5968C11.9616 4.5968 11.4636 4.8116 11.0974 5.2404C10.7317 5.6696 10.5486 6.259 10.5486 7.009C10.5486 7.7531 10.7317 8.3381 11.0974 8.7639Z"
        />
      </svg>
      <svg aria-hidden="true" viewBox="0 0 18 14" slot="off">
        <path
          d="M5.73219 10.258C5.10819 10.258 4.57009 10.1218 4.11699 9.8488C3.66389 9.5758 3.31429 9.1945 3.06869 8.7057C2.82259 8.2164 2.69958 7.651 2.69958 7.0089C2.69958 6.361 2.82259 5.7926 3.06869 5.3033C3.31429 4.8145 3.66389 4.4322 4.11699 4.1558C4.57009 3.8799 5.10819 3.7417 5.73219 3.7417C6.47049 3.7417 7.07348 3.9219 7.54128 4.2817C8.00958 4.6421 8.30638 5.146 8.43238 5.7939H7.37039C7.28639 5.4282 7.10618 5.1367 6.83039 4.9209C6.55459 4.7051 6.18538 4.5967 5.72348 4.5967C5.09358 4.5967 4.59559 4.8115 4.22939 5.2403C3.86369 5.6695 3.68058 6.2589 3.68058 7.0089C3.68058 7.753 3.86369 8.338 4.22939 8.7638C4.59559 9.1901 5.09368 9.403 5.72348 9.403C6.18538 9.403 6.55459 9.3009 6.83039 9.0968C7.10629 8.8932 7.28649 8.6139 7.37039 8.2599H8.43238C8.30638 8.8839 8.00948 9.3732 7.54128 9.7272C7.07348 10.0812 6.47049 10.258 5.73219 10.258Z"
        />
        <path
          d="M12.6003 10.258C11.9763 10.258 11.4382 10.1218 10.9851 9.8488C10.532 9.5758 10.1824 9.1945 9.93685 8.7057C9.69075 8.2164 9.56775 7.651 9.56775 7.0089C9.56775 6.361 9.69075 5.7926 9.93685 5.3033C10.1824 4.8145 10.532 4.4322 10.9851 4.1558C11.4382 3.8799 11.9763 3.7417 12.6003 3.7417C13.3386 3.7417 13.9416 3.9219 14.4094 4.2817C14.8777 4.6421 15.1745 5.146 15.3005 5.7939H14.2385C14.1545 5.4282 13.9743 5.1367 13.6985 4.9209C13.4227 4.7051 13.0535 4.5967 12.5916 4.5967C11.9617 4.5967 11.4637 4.8115 11.0975 5.2403C10.7318 5.6695 10.5487 6.2589 10.5487 7.0089C10.5487 7.753 10.7318 8.338 11.0975 8.7638C11.4637 9.1901 11.9618 9.403 12.5916 9.403C13.0535 9.403 13.4227 9.3009 13.6985 9.0968C13.9744 8.8932 14.1546 8.6139 14.2385 8.2599H15.3005C15.1745 8.8839 14.8776 9.3732 14.4094 9.7272C13.9416 10.0812 13.3386 10.258 12.6003 10.258Z"
        />
        <path
          d="M15.9891 1C16.5465 1 17 1.4535 17 2.011V11.9891C17 12.5465 16.5465 13 15.9891 13H2.0109C1.4535 13 1 12.5465 1 11.9891V2.0109C1 1.4535 1.4535 0.9999 2.0109 0.9999L15.9891 1ZM15.9891 0H2.0109C0.9003 0 0 0.9003 0 2.0109V11.9891C0 13.0997 0.9003 14 2.0109 14H15.9891C17.0997 14 18 13.0997 18 11.9891V2.0109C18 0.9003 17.0997 0 15.9891 0Z"
        />
      </svg>
    </media-captions-menu-button>
    <media-captions-menu
      hidden
      anchor="auto"
      part="bottom captions menu"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
      exportparts="menu-item"
    >
      <div slot="checked-indicator">
        <style>
          .indicator {
            position: relative;
            top: 1px;
            width: 0.9em;
            height: auto;
            fill: var(--_accent-color);
            margin-right: 5px;
          }

          [aria-checked='false'] .indicator {
            display: none;
          }
        </style>
        <svg viewBox="0 0 14 18" class="indicator">
          <path
            d="M12.252 3.48c-.115.033-.301.161-.425.291-.059.063-1.407 1.815-2.995 3.894s-2.897 3.79-2.908 3.802c-.013.014-.661-.616-1.672-1.624-.908-.905-1.702-1.681-1.765-1.723-.401-.27-.783-.211-1.176.183a1.285 1.285 0 0 0-.261.342.582.582 0 0 0-.082.35c0 .165.01.205.08.35.075.153.213.296 2.182 2.271 1.156 1.159 2.17 2.159 2.253 2.222.189.143.338.196.539.194.203-.003.412-.104.618-.299.205-.193 6.7-8.693 6.804-8.903a.716.716 0 0 0 .085-.345c.01-.179.005-.203-.062-.339-.124-.252-.45-.531-.746-.639a.784.784 0 0 0-.469-.027"
            fill-rule="evenodd"
          />
        </svg></div
    ></media-captions-menu>
  </template>

  <template partial="AirplayButton">
    <media-airplay-button part="bottom airplay button" disabled="{{disabled}}" aria-disabled="{{disabled}}">
      <svg viewBox="0 0 18 14" aria-hidden="true" slot="icon">
        <path
          d="M16.1383 0H1.8618C0.8335 0 0 0.8335 0 1.8617V10.1382C0 11.1664 0.8335 12 1.8618 12H3.076C3.1204 11.9433 3.1503 11.8785 3.2012 11.826L4.004 11H1.8618C1.3866 11 1 10.6134 1 10.1382V1.8617C1 1.3865 1.3866 0.9999 1.8618 0.9999H16.1383C16.6135 0.9999 17.0001 1.3865 17.0001 1.8617V10.1382C17.0001 10.6134 16.6135 11 16.1383 11H13.9961L14.7989 11.826C14.8499 11.8785 14.8798 11.9432 14.9241 12H16.1383C17.1665 12 18.0001 11.1664 18.0001 10.1382V1.8617C18 0.8335 17.1665 0 16.1383 0Z"
        />
        <path
          d="M9.55061 8.21903C9.39981 8.06383 9.20001 7.98633 9.00011 7.98633C8.80021 7.98633 8.60031 8.06383 8.44951 8.21903L4.09771 12.697C3.62471 13.1838 3.96961 13.9998 4.64831 13.9998H13.3518C14.0304 13.9998 14.3754 13.1838 13.9023 12.697L9.55061 8.21903Z"
        />
      </svg>
    </media-airplay-button>
  </template>

  <template partial="FullscreenButton">
    <media-fullscreen-button part="bottom fullscreen button" disabled="{{disabled}}" aria-disabled="{{disabled}}">
      <svg viewBox="0 0 18 14" aria-hidden="true" slot="enter">
        <path
          d="M1.00745 4.39539L1.01445 1.98789C1.01605 1.43049 1.47085 0.978289 2.02835 0.979989L6.39375 0.992589L6.39665 -0.007411L2.03125 -0.020011C0.920646 -0.023211 0.0176463 0.874489 0.0144463 1.98509L0.00744629 4.39539H1.00745Z"
        />
        <path
          d="M17.0144 2.03431L17.0076 4.39541H18.0076L18.0144 2.03721C18.0176 0.926712 17.1199 0.0237125 16.0093 0.0205125L11.6439 0.0078125L11.641 1.00781L16.0064 1.02041C16.5638 1.02201 17.016 1.47681 17.0144 2.03431Z"
        />
        <path
          d="M16.9925 9.60498L16.9855 12.0124C16.9839 12.5698 16.5291 13.022 15.9717 13.0204L11.6063 13.0078L11.6034 14.0078L15.9688 14.0204C17.0794 14.0236 17.9823 13.1259 17.9855 12.0153L17.9925 9.60498H16.9925Z"
        />
        <path
          d="M0.985626 11.9661L0.992426 9.60498H-0.0074737L-0.0142737 11.9632C-0.0174737 13.0738 0.880226 13.9767 1.99083 13.98L6.35623 13.9926L6.35913 12.9926L1.99373 12.98C1.43633 12.9784 0.983926 12.5236 0.985626 11.9661Z"
        />
      </svg>
      <svg viewBox="0 0 18 14" aria-hidden="true" slot="exit">
        <path
          d="M5.39655 -0.0200195L5.38955 2.38748C5.38795 2.94488 4.93315 3.39708 4.37565 3.39538L0.0103463 3.38278L0.00744629 4.38278L4.37285 4.39538C5.48345 4.39858 6.38635 3.50088 6.38965 2.39028L6.39665 -0.0200195H5.39655Z"
        />
        <path
          d="M12.6411 2.36891L12.6479 0.0078125H11.6479L11.6411 2.36601C11.6379 3.47651 12.5356 4.37951 13.6462 4.38271L18.0116 4.39531L18.0145 3.39531L13.6491 3.38271C13.0917 3.38111 12.6395 2.92641 12.6411 2.36891Z"
        />
        <path
          d="M12.6034 14.0204L12.6104 11.613C12.612 11.0556 13.0668 10.6034 13.6242 10.605L17.9896 10.6176L17.9925 9.61759L13.6271 9.60499C12.5165 9.60179 11.6136 10.4995 11.6104 11.6101L11.6034 14.0204H12.6034Z"
        />
        <path
          d="M5.359 11.6315L5.3522 13.9926H6.3522L6.359 11.6344C6.3622 10.5238 5.4645 9.62088 4.3539 9.61758L-0.0115043 9.60498L-0.0144043 10.605L4.351 10.6176C4.9084 10.6192 5.3607 11.074 5.359 11.6315Z"
        />
      </svg>
    </media-fullscreen-button>
  </template>

  <template partial="CastButton">
    <media-cast-button part="bottom cast button" disabled="{{disabled}}" aria-disabled="{{disabled}}">
      <svg viewBox="0 0 18 14" aria-hidden="true" slot="enter">
        <path
          d="M16.0072 0H2.0291C0.9185 0 0.0181 0.9003 0.0181 2.011V5.5009C0.357 5.5016 0.6895 5.5275 1.0181 5.5669V2.011C1.0181 1.4536 1.4716 1 2.029 1H16.0072C16.5646 1 17.0181 1.4536 17.0181 2.011V11.9891C17.0181 12.5465 16.5646 13 16.0072 13H8.4358C8.4746 13.3286 8.4999 13.6611 8.4999 13.9999H16.0071C17.1177 13.9999 18.018 13.0996 18.018 11.989V2.011C18.0181 0.9003 17.1178 0 16.0072 0ZM0 6.4999V7.4999C3.584 7.4999 6.5 10.4159 6.5 13.9999H7.5C7.5 9.8642 4.1357 6.4999 0 6.4999ZM0 8.7499V9.7499C2.3433 9.7499 4.25 11.6566 4.25 13.9999H5.25C5.25 11.1049 2.895 8.7499 0 8.7499ZM0.0181 11V14H3.0181C3.0181 12.3431 1.675 11 0.0181 11Z"
        />
      </svg>
      <svg viewBox="0 0 18 14" aria-hidden="true" slot="exit">
        <path
          d="M15.9891 0H2.01103C0.900434 0 3.35947e-05 0.9003 3.35947e-05 2.011V5.5009C0.338934 5.5016 0.671434 5.5275 1.00003 5.5669V2.011C1.00003 1.4536 1.45353 1 2.01093 1H15.9891C16.5465 1 17 1.4536 17 2.011V11.9891C17 12.5465 16.5465 13 15.9891 13H8.41773C8.45653 13.3286 8.48183 13.6611 8.48183 13.9999H15.989C17.0996 13.9999 17.9999 13.0996 17.9999 11.989V2.011C18 0.9003 17.0997 0 15.9891 0ZM-0.0180664 6.4999V7.4999C3.56593 7.4999 6.48193 10.4159 6.48193 13.9999H7.48193C7.48193 9.8642 4.11763 6.4999 -0.0180664 6.4999ZM-0.0180664 8.7499V9.7499C2.32523 9.7499 4.23193 11.6566 4.23193 13.9999H5.23193C5.23193 11.1049 2.87693 8.7499 -0.0180664 8.7499ZM3.35947e-05 11V14H3.00003C3.00003 12.3431 1.65693 11 3.35947e-05 11Z"
        />
        <path d="M2.15002 5.634C5.18352 6.4207 7.57252 8.8151 8.35282 11.8499H15.8501V2.1499H2.15002V5.634Z" />
      </svg>
    </media-cast-button>
  </template>

  <template partial="LiveButton">
    <media-live-button part="{{section ?? 'top'}} live button" disabled="{{disabled}}" aria-disabled="{{disabled}}">
      <span slot="text">Live</span>
    </media-live-button>
  </template>

  <template partial="PlaybackRateMenu">
    <media-playback-rate-menu-button part="bottom playback-rate button"></media-playback-rate-menu-button>
    <media-playback-rate-menu
      hidden
      anchor="auto"
      rates="{{playbackrates}}"
      exportparts="menu-item"
      part="bottom playback-rate menu"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    ></media-playback-rate-menu>
  </template>

  <template partial="VolumeRange">
    <media-volume-range
      part="bottom volume range"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    ></media-volume-range>
  </template>

  <template partial="TimeDisplay">
    <media-time-display
      remaining="{{defaultshowremainingtime}}"
      showduration="{{!hideduration}}"
      part="bottom time display"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    ></media-time-display>
  </template>

  <template partial="TimeRange">
    <media-time-range part="bottom time range" disabled="{{disabled}}" aria-disabled="{{disabled}}" exportparts="thumb">
      <media-preview-thumbnail slot="preview"></media-preview-thumbnail>
      <media-preview-chapter-display slot="preview"></media-preview-chapter-display>
      <media-preview-time-display slot="preview"></media-preview-time-display>
      <div slot="preview" part="arrow"></div>
    </media-time-range>
  </template>

  <template partial="AudioTrackMenu">
    <media-audio-track-menu-button part="bottom audio-track button">
      <svg aria-hidden="true" slot="icon" viewBox="0 0 18 16">
        <path d="M9 15A7 7 0 1 1 9 1a7 7 0 0 1 0 14Zm0 1A8 8 0 1 0 9 0a8 8 0 0 0 0 16Z" />
        <path
          d="M5.2 6.3a.5.5 0 0 1 .5.5v2.4a.5.5 0 1 1-1 0V6.8a.5.5 0 0 1 .5-.5Zm2.4-2.4a.5.5 0 0 1 .5.5v7.2a.5.5 0 0 1-1 0V4.4a.5.5 0 0 1 .5-.5ZM10 5.5a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.4-.8a.5.5 0 0 1 .5.5v5.6a.5.5 0 0 1-1 0V5.2a.5.5 0 0 1 .5-.5Z"
        />
      </svg>
    </media-audio-track-menu-button>
    <media-audio-track-menu
      hidden
      anchor="auto"
      part="bottom audio-track menu"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
      exportparts="menu-item"
    >
      <div slot="checked-indicator">
        <style>
          .indicator {
            position: relative;
            top: 1px;
            width: 0.9em;
            height: auto;
            fill: var(--_accent-color);
            margin-right: 5px;
          }

          [aria-checked='false'] .indicator {
            display: none;
          }
        </style>
        <svg viewBox="0 0 14 18" class="indicator">
          <path
            d="M12.252 3.48c-.115.033-.301.161-.425.291-.059.063-1.407 1.815-2.995 3.894s-2.897 3.79-2.908 3.802c-.013.014-.661-.616-1.672-1.624-.908-.905-1.702-1.681-1.765-1.723-.401-.27-.783-.211-1.176.183a1.285 1.285 0 0 0-.261.342.582.582 0 0 0-.082.35c0 .165.01.205.08.35.075.153.213.296 2.182 2.271 1.156 1.159 2.17 2.159 2.253 2.222.189.143.338.196.539.194.203-.003.412-.104.618-.299.205-.193 6.7-8.693 6.804-8.903a.716.716 0 0 0 .085-.345c.01-.179.005-.203-.062-.339-.124-.252-.45-.531-.746-.639a.784.784 0 0 0-.469-.027"
            fill-rule="evenodd"
          />
        </svg>
      </div>
    </media-audio-track-menu>
  </template>

  <template partial="RenditionMenu">
    <media-rendition-menu-button part="bottom rendition button">
      <svg aria-hidden="true" slot="icon" viewBox="0 0 18 14">
        <path
          d="M2.25 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM9 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm6.75 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
        />
      </svg>
    </media-rendition-menu-button>
    <media-rendition-menu
      hidden
      anchor="auto"
      part="bottom rendition menu"
      disabled="{{disabled}}"
      aria-disabled="{{disabled}}"
    >
      <div slot="checked-indicator">
        <style>
          .indicator {
            position: relative;
            top: 1px;
            width: 0.9em;
            height: auto;
            fill: var(--_accent-color);
            margin-right: 5px;
          }

          [aria-checked='false'] .indicator {
            opacity: 0;
          }
        </style>
        <svg viewBox="0 0 14 18" class="indicator">
          <path
            d="M12.252 3.48c-.115.033-.301.161-.425.291-.059.063-1.407 1.815-2.995 3.894s-2.897 3.79-2.908 3.802c-.013.014-.661-.616-1.672-1.624-.908-.905-1.702-1.681-1.765-1.723-.401-.27-.783-.211-1.176.183a1.285 1.285 0 0 0-.261.342.582.582 0 0 0-.082.35c0 .165.01.205.08.35.075.153.213.296 2.182 2.271 1.156 1.159 2.17 2.159 2.253 2.222.189.143.338.196.539.194.203-.003.412-.104.618-.299.205-.193 6.7-8.693 6.804-8.903a.716.716 0 0 0 .085-.345c.01-.179.005-.203-.062-.339-.124-.252-.45-.531-.746-.639a.784.784 0 0 0-.469-.027"
            fill-rule="evenodd"
          />
        </svg>
      </div>
    </media-rendition-menu>
  </template>

  <template partial="MuxBadge">
    <div part="mux-badge">
      <a href="https://www.mux.com/player" target="_blank">
        <span class="mux-badge-text">Powered by</span>
        <div class="mux-badge-logo">
          <svg
            viewBox="0 0 1600 500"
            style="fill-rule: evenodd; clip-rule: evenodd; stroke-linejoin: round; stroke-miterlimit: 2"
          >
            <g>
              <path
                d="M994.287,93.486c-17.121,-0 -31,-13.879 -31,-31c0,-17.121 13.879,-31 31,-31c17.121,-0 31,13.879 31,31c0,17.121 -13.879,31 -31,31m0,-93.486c-34.509,-0 -62.484,27.976 -62.484,62.486l0,187.511c0,68.943 -56.09,125.033 -125.032,125.033c-68.942,-0 -125.03,-56.09 -125.03,-125.033l0,-187.511c0,-34.51 -27.976,-62.486 -62.485,-62.486c-34.509,-0 -62.484,27.976 -62.484,62.486l0,187.511c0,137.853 112.149,250.003 249.999,250.003c137.851,-0 250.001,-112.15 250.001,-250.003l0,-187.511c0,-34.51 -27.976,-62.486 -62.485,-62.486"
                style="fill-rule: nonzero"
              ></path>
              <path
                d="M1537.51,468.511c-17.121,-0 -31,-13.879 -31,-31c0,-17.121 13.879,-31 31,-31c17.121,-0 31,13.879 31,31c0,17.121 -13.879,31 -31,31m-275.883,-218.509l-143.33,143.329c-24.402,24.402 -24.402,63.966 0,88.368c24.402,24.402 63.967,24.402 88.369,-0l143.33,-143.329l143.328,143.329c24.402,24.4 63.967,24.402 88.369,-0c24.403,-24.402 24.403,-63.966 0.001,-88.368l-143.33,-143.329l0.001,-0.004l143.329,-143.329c24.402,-24.402 24.402,-63.965 0,-88.367c-24.402,-24.402 -63.967,-24.402 -88.369,-0l-143.329,143.328l-143.329,-143.328c-24.402,-24.401 -63.967,-24.402 -88.369,-0c-24.402,24.402 -24.402,63.965 0,88.367l143.329,143.329l0,0.004Z"
                style="fill-rule: nonzero"
              ></path>
              <path
                d="M437.511,468.521c-17.121,-0 -31,-13.879 -31,-31c0,-17.121 13.879,-31 31,-31c17.121,-0 31,13.879 31,31c0,17.121 -13.879,31 -31,31m23.915,-463.762c-23.348,-9.672 -50.226,-4.327 -68.096,13.544l-143.331,143.329l-143.33,-143.329c-17.871,-17.871 -44.747,-23.216 -68.096,-13.544c-23.349,9.671 -38.574,32.455 -38.574,57.729l0,375.026c0,34.51 27.977,62.486 62.487,62.486c34.51,-0 62.486,-27.976 62.486,-62.486l0,-224.173l80.843,80.844c24.404,24.402 63.965,24.402 88.369,-0l80.843,-80.844l0,224.173c0,34.51 27.976,62.486 62.486,62.486c34.51,-0 62.486,-27.976 62.486,-62.486l0,-375.026c0,-25.274 -15.224,-48.058 -38.573,-57.729"
                style="fill-rule: nonzero"
              ></path>
            </g>
          </svg>
        </div>
      </a>
    </div>
  </template>

  <media-controller
    part="controller"
    defaultstreamtype="{{defaultstreamtype ?? 'on-demand'}}"
    breakpoints="sm:470"
    gesturesdisabled="{{disabled}}"
    hotkeys="{{hotkeys}}"
    nohotkeys="{{nohotkeys}}"
    novolumepref="{{novolumepref}}"
    audio="{{audio}}"
    noautoseektolive="{{noautoseektolive}}"
    defaultsubtitles="{{defaultsubtitles}}"
    defaultduration="{{defaultduration ?? false}}"
    keyboardforwardseekoffset="{{forwardseekoffset}}"
    keyboardbackwardseekoffset="{{backwardseekoffset}}"
    exportparts="layer, media-layer, poster-layer, vertical-layer, centered-layer, gesture-layer"
    style="--_pre-playback-place:{{preplaybackplace ?? 'center'}}"
  >
    <slot name="media" slot="media"></slot>
    <slot name="poster" slot="poster"></slot>

    <media-loading-indicator slot="centered-chrome" noautohide></media-loading-indicator>

    <template if="!audio">
      <media-error-dialog slot="dialog" noautohide></media-error-dialog>
      <!-- Pre-playback UI -->
      <!-- same for both on-demand and live -->
      <div slot="centered-chrome" class="center-controls pre-playback">
        <template if="!breakpointsm">{{>PlayButton section="center"}}</template>
        <template if="breakpointsm">{{>PrePlayButton section="center"}}</template>
      </div>

      <!-- Mux Badge -->
      <template if="proudlydisplaymuxbadge"> {{>MuxBadge}} </template>

      <!-- Autoplay centered unmute button -->
      <!--
        todo: figure out how show this with available state variables
        needs to show when:
        - autoplay is enabled
        - playback has been successful
        - audio is muted
        - in place / instead of the pre-plaback play button
        - not to show again after user has interacted with this button
          - OR user has interacted with the mute button in the control bar
      -->
      <!--
        There should be a >MuteButton to the left of the "Unmute" text, but a templating bug
        makes it appear even if commented out in the markup, add it back when code is un-commented
      -->
      <!-- <div slot="centered-chrome" class="autoplay-unmute">
        <div role="button" class="autoplay-unmute-btn">Unmute</div>
      </div> -->

      <template if="streamtype == 'on-demand'">
        <template if="breakpointsm">
          <media-control-bar part="control-bar top" slot="top-chrome">{{>TitleDisplay}} </media-control-bar>
        </template>
        {{>TimeRange}}
        <media-control-bar part="control-bar bottom">
          {{>PlayButton}} {{>SeekBackwardButton}} {{>SeekForwardButton}} {{>TimeDisplay}} {{>MuteButton}}
          {{>VolumeRange}}
          <div class="spacer"></div>
          {{>RenditionMenu}} {{>PlaybackRateMenu}} {{>AudioTrackMenu}} {{>CaptionsMenu}} {{>AirplayButton}}
          {{>CastButton}} {{>PipButton}} {{>FullscreenButton}}
        </media-control-bar>
      </template>

      <template if="streamtype == 'live'">
        <media-control-bar part="control-bar top" slot="top-chrome">
          {{>LiveButton}}
          <template if="breakpointsm"> {{>TitleDisplay}} </template>
        </media-control-bar>
        <template if="targetlivewindow > 0">{{>TimeRange}}</template>
        <media-control-bar part="control-bar bottom">
          {{>PlayButton}}
          <template if="targetlivewindow > 0">{{>SeekBackwardButton}} {{>SeekForwardButton}}</template>
          {{>MuteButton}} {{>VolumeRange}}
          <div class="spacer"></div>
          {{>RenditionMenu}} {{>AudioTrackMenu}} {{>CaptionsMenu}} {{>AirplayButton}} {{>CastButton}} {{>PipButton}}
          {{>FullscreenButton}}
        </media-control-bar>
      </template>
    </template>

    <template if="audio">
      <template if="streamtype == 'on-demand'">
        <template if="title">
          <media-control-bar part="control-bar top">{{>TitleDisplay}}</media-control-bar>
        </template>
        <media-control-bar part="control-bar bottom">
          {{>PlayButton}}
          <template if="breakpointsm"> {{>SeekBackwardButton}} {{>SeekForwardButton}} </template>
          {{>MuteButton}}
          <template if="breakpointsm">{{>VolumeRange}}</template>
          {{>TimeDisplay}} {{>TimeRange}}
          <template if="breakpointsm">{{>PlaybackRateMenu}}</template>
          {{>AirplayButton}} {{>CastButton}}
        </media-control-bar>
      </template>

      <template if="streamtype == 'live'">
        <template if="title">
          <media-control-bar part="control-bar top">{{>TitleDisplay}}</media-control-bar>
        </template>
        <media-control-bar part="control-bar bottom">
          {{>PlayButton}} {{>LiveButton section="bottom"}} {{>MuteButton}}
          <template if="breakpointsm">
            {{>VolumeRange}}
            <template if="targetlivewindow > 0"> {{>SeekBackwardButton}} {{>SeekForwardButton}} </template>
          </template>
          <template if="targetlivewindow > 0"> {{>TimeDisplay}} {{>TimeRange}} </template>
          <template if="!targetlivewindow"><div class="spacer"></div></template>
          {{>AirplayButton}} {{>CastButton}}
        </media-control-bar>
      </template>
    </template>

    <slot></slot>
  </media-controller>
</template>
`,Eh=Kl.createElement("template");"innerHTML"in Eh&&(Eh.innerHTML=xk);var j_,X_,J_=class extends ll{};J_.template=(X_=(j_=Eh.content)==null?void 0:j_.children)==null?void 0:X_[0],mi.customElements.get("media-theme-gerwig")||mi.customElements.define("media-theme-gerwig",J_);var Ok="gerwig",Oi={SRC:"src",POSTER:"poster"},w={STYLE:"style",DEFAULT_HIDDEN_CAPTIONS:"default-hidden-captions",PRIMARY_COLOR:"primary-color",SECONDARY_COLOR:"secondary-color",ACCENT_COLOR:"accent-color",FORWARD_SEEK_OFFSET:"forward-seek-offset",BACKWARD_SEEK_OFFSET:"backward-seek-offset",PLAYBACK_TOKEN:"playback-token",THUMBNAIL_TOKEN:"thumbnail-token",STORYBOARD_TOKEN:"storyboard-token",FULLSCREEN_ELEMENT:"fullscreen-element",DRM_TOKEN:"drm-token",STORYBOARD_SRC:"storyboard-src",THUMBNAIL_TIME:"thumbnail-time",AUDIO:"audio",NOHOTKEYS:"nohotkeys",HOTKEYS:"hotkeys",PLAYBACK_RATES:"playbackrates",DEFAULT_SHOW_REMAINING_TIME:"default-show-remaining-time",DEFAULT_DURATION:"default-duration",TITLE:"title",VIDEO_TITLE:"video-title",PLACEHOLDER:"placeholder",THEME:"theme",DEFAULT_STREAM_TYPE:"default-stream-type",TARGET_LIVE_WINDOW:"target-live-window",EXTRA_SOURCE_PARAMS:"extra-source-params",NO_VOLUME_PREF:"no-volume-pref",NO_MUTED_PREF:"no-muted-pref",CAST_RECEIVER:"cast-receiver",NO_TOOLTIPS:"no-tooltips",PROUDLY_DISPLAY_MUX_BADGE:"proudly-display-mux-badge",DISABLE_PSEUDO_ENDED:"disable-pseudo-ended"},bh=["audio","backwardseekoffset","defaultduration","defaultshowremainingtime","defaultsubtitles","noautoseektolive","disabled","exportparts","forwardseekoffset","hideduration","hotkeys","nohotkeys","playbackrates","defaultstreamtype","streamtype","style","targetlivewindow","template","title","videotitle","novolumepref","nomutedpref","proudlydisplaymuxbadge"];function Nk(e,t){var i,a,r;return da(U({src:!e.playbackId&&e.src,playbackId:e.playbackId,hasSrc:!!e.playbackId||!!e.src||!!e.currentSrc,poster:e.poster,storyboard:((i=e.media)==null?void 0:i.currentSrc)&&e.storyboard,storyboardSrc:e.getAttribute(w.STORYBOARD_SRC),fullscreenElement:e.getAttribute(w.FULLSCREEN_ELEMENT),placeholder:e.getAttribute("placeholder"),themeTemplate:Uk(e),thumbnailTime:!e.tokens.thumbnail&&e.thumbnailTime,autoplay:e.autoplay,crossOrigin:e.crossOrigin,loop:e.loop,noHotKeys:e.hasAttribute(w.NOHOTKEYS),hotKeys:e.getAttribute(w.HOTKEYS),muted:e.muted,paused:e.paused,preload:e.preload,envKey:e.envKey,preferCmcd:e.preferCmcd,debug:e.debug,disableTracking:e.disableTracking,disableCookies:e.disableCookies,tokens:e.tokens,beaconCollectionDomain:e.beaconCollectionDomain,maxResolution:e.maxResolution,minResolution:e.minResolution,maxAutoResolution:e.maxAutoResolution,programStartTime:e.programStartTime,programEndTime:e.programEndTime,assetStartTime:e.assetStartTime,assetEndTime:e.assetEndTime,renditionOrder:e.renditionOrder,metadata:e.metadata,playerInitTime:e.playerInitTime,playerSoftwareName:e.playerSoftwareName,playerSoftwareVersion:e.playerSoftwareVersion,startTime:e.startTime,initialBandwidthEstimateKbps:e.initialBandwidthEstimateKbps,initialEstimateSegments:e.initialEstimateSegments,minPreloadSegments:e.minPreloadSegments,preferPlayback:e.preferPlayback,audio:e.audio,defaultStreamType:e.defaultStreamType,targetLiveWindow:e.getAttribute(f.TARGET_LIVE_WINDOW),streamType:_h(e.getAttribute(f.STREAM_TYPE)),primaryColor:e.getAttribute(w.PRIMARY_COLOR),secondaryColor:e.getAttribute(w.SECONDARY_COLOR),accentColor:e.getAttribute(w.ACCENT_COLOR),forwardSeekOffset:e.forwardSeekOffset,backwardSeekOffset:e.backwardSeekOffset,defaultHiddenCaptions:e.defaultHiddenCaptions,defaultDuration:e.defaultDuration,defaultShowRemainingTime:e.defaultShowRemainingTime,hideDuration:Bk(e),playbackRates:e.getAttribute(w.PLAYBACK_RATES),customDomain:(a=e.getAttribute(f.CUSTOM_DOMAIN))!=null?a:void 0,title:e.getAttribute(w.TITLE),videoTitle:(r=e.getAttribute(w.VIDEO_TITLE))!=null?r:e.getAttribute(w.TITLE),novolumepref:e.hasAttribute(w.NO_VOLUME_PREF),nomutedpref:e.hasAttribute(w.NO_MUTED_PREF),proudlyDisplayMuxBadge:e.hasAttribute(w.PROUDLY_DISPLAY_MUX_BADGE),castReceiver:e.castReceiver,disablePseudoEnded:e.hasAttribute(w.DISABLE_PSEUDO_ENDED),maxReconnectRetries:e.maxReconnectRetries,capRenditionToPlayerSize:e.capRenditionToPlayerSize},t),{extraSourceParams:e.extraSourceParams})}var Pk=hv.formatErrorMessage;hv.formatErrorMessage=e=>{var t,i;if(e instanceof M){let a=Mk(e,!1);return`
      ${a!=null&&a.title?`<h3>${a.title}</h3>`:""}
      ${a!=null&&a.message||a!=null&&a.linkUrl?`<p>
        ${a==null?void 0:a.message}
        ${a!=null&&a.linkUrl?`<a
              href="${a.linkUrl}"
              target="_blank"
              rel="external noopener"
              aria-label="${(t=a.linkText)!=null?t:""} ${O("(opens in a new window)")}"
              >${(i=a.linkText)!=null?i:a.linkUrl}</a
            >`:""}
      </p>`:""}
    `}return Pk(e)};function Uk(e){var t,i;let a=e.theme;if(a){let r=(i=(t=e.getRootNode())==null?void 0:t.getElementById)==null?void 0:i.call(t,a);if(r&&r instanceof HTMLTemplateElement)return r;a.startsWith("media-theme-")||(a=`media-theme-${a}`);let n=mi.customElements.get(a);if(n!=null&&n.template)return n.template}}function Bk(e){var t;let i=(t=e.mediaController)==null?void 0:t.querySelector("media-time-display");return i&&getComputedStyle(i).getPropertyValue("--media-duration-display-display").trim()==="none"}function ns(e){let t=e.videoTitle?{video_title:e.videoTitle}:{};return e.getAttributeNames().filter(i=>i.startsWith("metadata-")).reduce((i,a)=>{let r=e.getAttribute(a);return r!==null&&(i[a.replace(/^metadata-/,"").replace(/-/g,"_")]=r),i},t)}var Hk=Object.values(f),Wk=Object.values(Oi),Fk=Object.values(w),ef=F_(),tf="mux-player",af={isDialogOpen:!1},Kk={redundant_streams:!0},Vl,ss,ql,Oa,Yl,os,Gl,zl,Kr,Ql,Zl,jl,ls,$r,Xl,Te,Ni,rf,gh,Na,nf,sf,of,lf,$k=class extends q_{constructor(){super(),Me(this,Te),Me(this,Vl),Me(this,ss,!1),Me(this,ql,{}),Me(this,Oa,!0),Me(this,Yl,new sk(this,"hotkeys")),Me(this,os),Me(this,Gl,()=>Se(this,Te,Na).call(this)),Me(this,zl,()=>Se(this,Te,Na).call(this)),Me(this,Kr,()=>Se(this,Te,Na).call(this)),Me(this,Ql,e=>{e.composedPath().find(t=>{var i;return(i=t==null?void 0:t.hasAttribute)==null?void 0:i.call(t,"data-mux-reload")})&&(e.preventDefault(),window.location.reload())}),Me(this,Zl,e=>{var t;((t=e.composedPath()[0])==null?void 0:t.localName)==="media-error-dialog"&&Se(this,Te,gh).call(this,{isDialogOpen:!1})}),Me(this,jl,e=>{var t;((t=e.composedPath()[0])==null?void 0:t.localName)==="media-error-dialog"&&(H_(this,Kl.activeElement)||e.preventDefault())}),Me(this,ls),Me(this,$r,U({},af)),Me(this,Xl,e=>{var t;let i=(t=this.media)==null?void 0:t.error;if(!(i instanceof M)){let{message:r,code:n}=i!=null?i:{};i=new M(r,n)}if(!(i!=null&&i.fatal)){xi(i),i.data&&xi(`${i.name} data:`,i.data);return}let a=Z_(i,!1);a.message&&$_(a),st(i),i.data&&st(`${i.name} data:`,i.data),Se(this,Te,gh).call(this,{isDialogOpen:!0})}),rt(this,Vl,Ss()),this.attachShadow({mode:"open"}),Se(this,Te,rf).call(this),this.isConnected&&Se(this,Te,Ni).call(this)}static get NAME(){return tf}static get VERSION(){return ef}static get observedAttributes(){var e;return[...(e=q_.observedAttributes)!=null?e:[],...Wk,...Hk,...Fk]}setAttribute(e,t){super.setAttribute(e,t),e.startsWith("metadata-")&&this.media&&(this.media.metadata=ns(this))}removeAttribute(e){super.removeAttribute(e),e.startsWith("metadata-")&&this.media&&(this.media.metadata=ns(this))}get mediaTheme(){var e;return(e=this.shadowRoot)==null?void 0:e.querySelector("media-theme")}get mediaController(){var e,t;return(t=(e=this.mediaTheme)==null?void 0:e.shadowRoot)==null?void 0:t.querySelector("media-controller")}connectedCallback(){Se(this,Te,Ni).call(this);let e=this.media;e&&(e.metadata=ns(this))}disconnectedCallback(){var e,t,i,a,r,n,s,o,l,c;(e=K(this,os))==null||e.disconnect(),(t=this.media)==null||t.removeEventListener("streamtypechange",K(this,Gl)),(i=this.media)==null||i.removeEventListener("loadstart",K(this,zl)),this.removeEventListener("error",K(this,Xl)),this.removeEventListener("click",K(this,Ql)),(a=this.mediaTheme)==null||a.removeEventListener("close",K(this,Zl)),(r=this.mediaTheme)==null||r.removeEventListener("focusin",K(this,jl)),this.media&&(this.media.errorTranslator=void 0),(s=(n=this.media)==null?void 0:n.textTracks)==null||s.removeEventListener("addtrack",K(this,Kr)),(l=(o=this.media)==null?void 0:o.textTracks)==null||l.removeEventListener("removetrack",K(this,Kr)),(c=K(this,ls))==null||c.call(this),rt(this,ls,void 0),rt(this,ss,!1)}attributeChangedCallback(e,t,i){switch(Se(this,Te,Ni).call(this),super.attributeChangedCallback(e,t,i),e){case w.HOTKEYS:K(this,Yl).value=i;break;case w.THUMBNAIL_TIME:{i!=null&&this.tokens.thumbnail&&xi(O("Use of thumbnail-time with thumbnail-token is currently unsupported. Ignore thumbnail-time.").toString());break}case w.THUMBNAIL_TOKEN:{if(i){let a=Ka(i);if(a){let{aud:r}=a,n=sn.THUMBNAIL;r!==n&&xi(O("The {tokenNamePrefix}-token has an incorrect aud value: {aud}. aud value should be {expectedAud}.").format({aud:r,expectedAud:n,tokenNamePrefix:"thumbnail"}))}}break}case w.STORYBOARD_TOKEN:{if(i){let a=Ka(i);if(a){let{aud:r}=a,n=sn.STORYBOARD;r!==n&&xi(O("The {tokenNamePrefix}-token has an incorrect aud value: {aud}. aud value should be {expectedAud}.").format({aud:r,expectedAud:n,tokenNamePrefix:"storyboard"}))}}break}case w.DRM_TOKEN:{if(i){let a=Ka(i);if(a){let{aud:r}=a,n=sn.DRM;r!==n&&xi(O("The {tokenNamePrefix}-token has an incorrect aud value: {aud}. aud value should be {expectedAud}.").format({aud:r,expectedAud:n,tokenNamePrefix:"drm"}))}}break}case f.PLAYBACK_ID:{i!=null&&i.includes("?token")&&st(O("The specificed playback ID {playbackId} contains a token which must be provided via the playback-token attribute.").format({playbackId:i}));break}case f.STREAM_TYPE:{i&&![se.LIVE,se.ON_DEMAND,se.UNKNOWN].includes(i)?["ll-live","live:dvr","ll-live:dvr"].includes(this.streamType)?this.targetLiveWindow=i.includes("dvr")?Number.POSITIVE_INFINITY:0:$_({file:"invalid-stream-type.md",message:O("Invalid stream-type value supplied: `{streamType}`. Please provide stream-type as either: `on-demand` or `live`").format({streamType:this.streamType})}):i===se.LIVE?this.getAttribute(w.TARGET_LIVE_WINDOW)==null&&(this.targetLiveWindow=0):this.targetLiveWindow=Number.NaN;break}case w.FULLSCREEN_ELEMENT:{if(i!=null||i!==t){let a=Kl.getElementById(i),r=a==null?void 0:a.querySelector("mux-player");this.mediaController&&a&&r&&(this.mediaController.fullscreenElement=a)}break}case f.CAP_RENDITION_TO_PLAYER_SIZE:{(i==null||i!==t)&&(this.capRenditionToPlayerSize=i!=null?!0:void 0);break}case f.MAX_RECONNECT_RETRIES:{(i==null||i!==t)&&(this.maxReconnectRetries=Number(i));break}}[f.PLAYBACK_ID,Oi.SRC,w.PLAYBACK_TOKEN].includes(e)&&t!==i&&rt(this,$r,U(U({},K(this,$r)),af)),Se(this,Te,Na).call(this,{[nk(e)]:i})}requestFullscreen(e){return W(this,null,function*(){var t;if(!(!this.mediaController||this.mediaController.hasAttribute(h.MEDIA_IS_FULLSCREEN)))return(t=this.mediaController)==null||t.dispatchEvent(new mi.CustomEvent(x.MEDIA_ENTER_FULLSCREEN_REQUEST,{composed:!0,bubbles:!0})),new Promise((i,a)=>{var r;(r=this.mediaController)==null||r.addEventListener(zt.MEDIA_IS_FULLSCREEN,()=>i(),{once:!0})})})}exitFullscreen(){return W(this,null,function*(){var e;if(!(!this.mediaController||!this.mediaController.hasAttribute(h.MEDIA_IS_FULLSCREEN)))return(e=this.mediaController)==null||e.dispatchEvent(new mi.CustomEvent(x.MEDIA_EXIT_FULLSCREEN_REQUEST,{composed:!0,bubbles:!0})),new Promise((t,i)=>{var a;(a=this.mediaController)==null||a.addEventListener(zt.MEDIA_IS_FULLSCREEN,()=>t(),{once:!0})})})}get preferCmcd(){var e;return(e=this.getAttribute(f.PREFER_CMCD))!=null?e:void 0}set preferCmcd(e){e!==this.preferCmcd&&(e?Ts.includes(e)?this.setAttribute(f.PREFER_CMCD,e):xi(`Invalid value for preferCmcd. Must be one of ${Ts.join()}`):this.removeAttribute(f.PREFER_CMCD))}get hasPlayed(){var e,t;return(t=(e=this.mediaController)==null?void 0:e.hasAttribute(h.MEDIA_HAS_PLAYED))!=null?t:!1}get inLiveWindow(){var e;return(e=this.mediaController)==null?void 0:e.hasAttribute(h.MEDIA_TIME_IS_LIVE)}get _hls(){var e;return(e=this.media)==null?void 0:e._hls}get mux(){var e;return(e=this.media)==null?void 0:e.mux}get theme(){var e;return(e=this.getAttribute(w.THEME))!=null?e:Ok}set theme(e){this.setAttribute(w.THEME,`${e}`)}get themeProps(){let e=this.mediaTheme;if(!e)return;let t={};for(let i of e.getAttributeNames()){if(bh.includes(i))continue;let a=e.getAttribute(i);t[U_(i)]=a===""?!0:a}return t}set themeProps(e){var t,i;Se(this,Te,Ni).call(this);let a=U(U({},this.themeProps),e);for(let r in a){if(bh.includes(r))continue;let n=e==null?void 0:e[r];typeof n=="boolean"||n==null?(t=this.mediaTheme)==null||t.toggleAttribute(vh(r),!!n):(i=this.mediaTheme)==null||i.setAttribute(vh(r),n)}}get playbackId(){var e;return(e=this.getAttribute(f.PLAYBACK_ID))!=null?e:void 0}set playbackId(e){e?this.setAttribute(f.PLAYBACK_ID,e):this.removeAttribute(f.PLAYBACK_ID)}get src(){var e,t;return this.playbackId?(e=pi(this,Oi.SRC))!=null?e:void 0:(t=this.getAttribute(Oi.SRC))!=null?t:void 0}set src(e){e?this.setAttribute(Oi.SRC,e):this.removeAttribute(Oi.SRC)}get poster(){var e;let t=this.getAttribute(Oi.POSTER);if(t!=null)return t;let{tokens:i}=this;if(i.playback&&!i.thumbnail){xi("Missing expected thumbnail token. No poster image will be shown");return}if(this.playbackId&&!this.audio)return ik(this.playbackId,{customDomain:this.customDomain,thumbnailTime:(e=this.thumbnailTime)!=null?e:this.startTime,programTime:this.programStartTime,token:i.thumbnail})}set poster(e){e||e===""?this.setAttribute(Oi.POSTER,e):this.removeAttribute(Oi.POSTER)}get storyboardSrc(){var e;return(e=this.getAttribute(w.STORYBOARD_SRC))!=null?e:void 0}set storyboardSrc(e){e?this.setAttribute(w.STORYBOARD_SRC,e):this.removeAttribute(w.STORYBOARD_SRC)}get storyboard(){let{tokens:e}=this;if(this.storyboardSrc&&!e.storyboard)return this.storyboardSrc;if(!(this.audio||!this.playbackId||!this.streamType||[se.LIVE,se.UNKNOWN].includes(this.streamType)||e.playback&&!e.storyboard))return ak(this.playbackId,{customDomain:this.customDomain,token:e.storyboard,programStartTime:this.programStartTime,programEndTime:this.programEndTime})}get audio(){return this.hasAttribute(w.AUDIO)}set audio(e){if(!e){this.removeAttribute(w.AUDIO);return}this.setAttribute(w.AUDIO,"")}get hotkeys(){return K(this,Yl)}get nohotkeys(){return this.hasAttribute(w.NOHOTKEYS)}set nohotkeys(e){if(!e){this.removeAttribute(w.NOHOTKEYS);return}this.setAttribute(w.NOHOTKEYS,"")}get thumbnailTime(){return Ge(this.getAttribute(w.THUMBNAIL_TIME))}set thumbnailTime(e){this.setAttribute(w.THUMBNAIL_TIME,`${e}`)}get videoTitle(){var e,t;return(t=(e=this.getAttribute(w.VIDEO_TITLE))!=null?e:this.getAttribute(w.TITLE))!=null?t:""}set videoTitle(e){e!==this.videoTitle&&(e?this.setAttribute(w.VIDEO_TITLE,e):this.removeAttribute(w.VIDEO_TITLE))}get placeholder(){var e;return(e=pi(this,w.PLACEHOLDER))!=null?e:""}set placeholder(e){this.setAttribute(w.PLACEHOLDER,`${e}`)}get primaryColor(){var e,t;let i=this.getAttribute(w.PRIMARY_COLOR);if(i!=null||this.mediaTheme&&(i=(t=(e=mi.getComputedStyle(this.mediaTheme))==null?void 0:e.getPropertyValue("--_primary-color"))==null?void 0:t.trim(),i))return i}set primaryColor(e){this.setAttribute(w.PRIMARY_COLOR,`${e}`)}get secondaryColor(){var e,t;let i=this.getAttribute(w.SECONDARY_COLOR);if(i!=null||this.mediaTheme&&(i=(t=(e=mi.getComputedStyle(this.mediaTheme))==null?void 0:e.getPropertyValue("--_secondary-color"))==null?void 0:t.trim(),i))return i}set secondaryColor(e){this.setAttribute(w.SECONDARY_COLOR,`${e}`)}get accentColor(){var e,t;let i=this.getAttribute(w.ACCENT_COLOR);if(i!=null||this.mediaTheme&&(i=(t=(e=mi.getComputedStyle(this.mediaTheme))==null?void 0:e.getPropertyValue("--_accent-color"))==null?void 0:t.trim(),i))return i}set accentColor(e){this.setAttribute(w.ACCENT_COLOR,`${e}`)}get defaultShowRemainingTime(){return this.hasAttribute(w.DEFAULT_SHOW_REMAINING_TIME)}set defaultShowRemainingTime(e){e?this.setAttribute(w.DEFAULT_SHOW_REMAINING_TIME,""):this.removeAttribute(w.DEFAULT_SHOW_REMAINING_TIME)}get playbackRates(){if(this.hasAttribute(w.PLAYBACK_RATES))return this.getAttribute(w.PLAYBACK_RATES).trim().split(/\s*,?\s+/).map(e=>Number(e)).filter(e=>!Number.isNaN(e)).sort((e,t)=>e-t)}set playbackRates(e){if(!e){this.removeAttribute(w.PLAYBACK_RATES);return}this.setAttribute(w.PLAYBACK_RATES,e.join(" "))}get forwardSeekOffset(){var e;return(e=Ge(this.getAttribute(w.FORWARD_SEEK_OFFSET)))!=null?e:10}set forwardSeekOffset(e){this.setAttribute(w.FORWARD_SEEK_OFFSET,`${e}`)}get backwardSeekOffset(){var e;return(e=Ge(this.getAttribute(w.BACKWARD_SEEK_OFFSET)))!=null?e:10}set backwardSeekOffset(e){this.setAttribute(w.BACKWARD_SEEK_OFFSET,`${e}`)}get defaultHiddenCaptions(){return this.hasAttribute(w.DEFAULT_HIDDEN_CAPTIONS)}set defaultHiddenCaptions(e){e?this.setAttribute(w.DEFAULT_HIDDEN_CAPTIONS,""):this.removeAttribute(w.DEFAULT_HIDDEN_CAPTIONS)}get defaultDuration(){return Ge(this.getAttribute(w.DEFAULT_DURATION))}set defaultDuration(e){e==null?this.removeAttribute(w.DEFAULT_DURATION):this.setAttribute(w.DEFAULT_DURATION,`${e}`)}get playerInitTime(){return this.hasAttribute(f.PLAYER_INIT_TIME)?Ge(this.getAttribute(f.PLAYER_INIT_TIME)):K(this,Vl)}set playerInitTime(e){e!=this.playerInitTime&&(e==null?this.removeAttribute(f.PLAYER_INIT_TIME):this.setAttribute(f.PLAYER_INIT_TIME,`${+e}`))}get playerSoftwareName(){var e;return(e=this.getAttribute(f.PLAYER_SOFTWARE_NAME))!=null?e:tf}get playerSoftwareVersion(){var e;return(e=this.getAttribute(f.PLAYER_SOFTWARE_VERSION))!=null?e:ef}get beaconCollectionDomain(){var e;return(e=this.getAttribute(f.BEACON_COLLECTION_DOMAIN))!=null?e:void 0}set beaconCollectionDomain(e){e!==this.beaconCollectionDomain&&(e?this.setAttribute(f.BEACON_COLLECTION_DOMAIN,e):this.removeAttribute(f.BEACON_COLLECTION_DOMAIN))}get maxResolution(){var e;return(e=this.getAttribute(f.MAX_RESOLUTION))!=null?e:void 0}set maxResolution(e){e!==this.maxResolution&&(e?this.setAttribute(f.MAX_RESOLUTION,e):this.removeAttribute(f.MAX_RESOLUTION))}get minResolution(){var e;return(e=this.getAttribute(f.MIN_RESOLUTION))!=null?e:void 0}set minResolution(e){e!==this.minResolution&&(e?this.setAttribute(f.MIN_RESOLUTION,e):this.removeAttribute(f.MIN_RESOLUTION))}get maxAutoResolution(){var e;return(e=this.getAttribute(f.MAX_AUTO_RESOLUTION))!=null?e:void 0}set maxAutoResolution(e){e==null?this.removeAttribute(f.MAX_AUTO_RESOLUTION):this.setAttribute(f.MAX_AUTO_RESOLUTION,e)}get renditionOrder(){var e;return(e=this.getAttribute(f.RENDITION_ORDER))!=null?e:void 0}set renditionOrder(e){e!==this.renditionOrder&&(e?this.setAttribute(f.RENDITION_ORDER,e):this.removeAttribute(f.RENDITION_ORDER))}get programStartTime(){return Ge(this.getAttribute(f.PROGRAM_START_TIME))}set programStartTime(e){e==null?this.removeAttribute(f.PROGRAM_START_TIME):this.setAttribute(f.PROGRAM_START_TIME,`${e}`)}get programEndTime(){return Ge(this.getAttribute(f.PROGRAM_END_TIME))}set programEndTime(e){e==null?this.removeAttribute(f.PROGRAM_END_TIME):this.setAttribute(f.PROGRAM_END_TIME,`${e}`)}get assetStartTime(){return Ge(this.getAttribute(f.ASSET_START_TIME))}set assetStartTime(e){e==null?this.removeAttribute(f.ASSET_START_TIME):this.setAttribute(f.ASSET_START_TIME,`${e}`)}get assetEndTime(){return Ge(this.getAttribute(f.ASSET_END_TIME))}set assetEndTime(e){e==null?this.removeAttribute(f.ASSET_END_TIME):this.setAttribute(f.ASSET_END_TIME,`${e}`)}get extraSourceParams(){return this.hasAttribute(w.EXTRA_SOURCE_PARAMS)?[...new URLSearchParams(this.getAttribute(w.EXTRA_SOURCE_PARAMS)).entries()].reduce((e,[t,i])=>(e[t]=i,e),{}):Kk}set extraSourceParams(e){e==null?this.removeAttribute(w.EXTRA_SOURCE_PARAMS):this.setAttribute(w.EXTRA_SOURCE_PARAMS,new URLSearchParams(e).toString())}get customDomain(){var e;return(e=this.getAttribute(f.CUSTOM_DOMAIN))!=null?e:void 0}set customDomain(e){e!==this.customDomain&&(e?this.setAttribute(f.CUSTOM_DOMAIN,e):this.removeAttribute(f.CUSTOM_DOMAIN))}get envKey(){var e;return(e=pi(this,f.ENV_KEY))!=null?e:void 0}set envKey(e){this.setAttribute(f.ENV_KEY,`${e}`)}get noVolumePref(){return this.hasAttribute(w.NO_VOLUME_PREF)}set noVolumePref(e){e?this.setAttribute(w.NO_VOLUME_PREF,""):this.removeAttribute(w.NO_VOLUME_PREF)}get noMutedPref(){return this.hasAttribute(w.NO_MUTED_PREF)}set noMutedPref(e){e?this.setAttribute(w.NO_MUTED_PREF,""):this.removeAttribute(w.NO_MUTED_PREF)}get debug(){return pi(this,f.DEBUG)!=null}set debug(e){e?this.setAttribute(f.DEBUG,""):this.removeAttribute(f.DEBUG)}get disableTracking(){return pi(this,f.DISABLE_TRACKING)!=null}set disableTracking(e){this.toggleAttribute(f.DISABLE_TRACKING,!!e)}get disableCookies(){return pi(this,f.DISABLE_COOKIES)!=null}set disableCookies(e){e?this.setAttribute(f.DISABLE_COOKIES,""):this.removeAttribute(f.DISABLE_COOKIES)}get streamType(){var e,t,i;return(i=(t=this.getAttribute(f.STREAM_TYPE))!=null?t:(e=this.media)==null?void 0:e.streamType)!=null?i:se.UNKNOWN}set streamType(e){this.setAttribute(f.STREAM_TYPE,`${e}`)}get defaultStreamType(){var e,t,i;return(i=(t=this.getAttribute(w.DEFAULT_STREAM_TYPE))!=null?t:(e=this.mediaController)==null?void 0:e.getAttribute(w.DEFAULT_STREAM_TYPE))!=null?i:se.ON_DEMAND}set defaultStreamType(e){e?this.setAttribute(w.DEFAULT_STREAM_TYPE,e):this.removeAttribute(w.DEFAULT_STREAM_TYPE)}get targetLiveWindow(){var e,t;return this.hasAttribute(w.TARGET_LIVE_WINDOW)?+this.getAttribute(w.TARGET_LIVE_WINDOW):(t=(e=this.media)==null?void 0:e.targetLiveWindow)!=null?t:Number.NaN}set targetLiveWindow(e){e==this.targetLiveWindow||Number.isNaN(e)&&Number.isNaN(this.targetLiveWindow)||(e==null?this.removeAttribute(w.TARGET_LIVE_WINDOW):this.setAttribute(w.TARGET_LIVE_WINDOW,`${+e}`))}get liveEdgeStart(){var e;return(e=this.media)==null?void 0:e.liveEdgeStart}get startTime(){return Ge(pi(this,f.START_TIME))}set startTime(e){this.setAttribute(f.START_TIME,`${e}`)}get initialBandwidthEstimateKbps(){return Ge(pi(this,f.INITIAL_BANDWIDTH_ESTIMATE_KBPS))}set initialBandwidthEstimateKbps(e){e==null?this.removeAttribute(f.INITIAL_BANDWIDTH_ESTIMATE_KBPS):this.setAttribute(f.INITIAL_BANDWIDTH_ESTIMATE_KBPS,`${e}`)}get initialEstimateSegments(){return Ge(pi(this,f.INITIAL_ESTIMATE_SEGMENTS))}set initialEstimateSegments(e){e==null?this.removeAttribute(f.INITIAL_ESTIMATE_SEGMENTS):this.setAttribute(f.INITIAL_ESTIMATE_SEGMENTS,`${e}`)}get minPreloadSegments(){return Ge(pi(this,f.MIN_PRELOAD_SEGMENTS))}set minPreloadSegments(e){e==null?this.removeAttribute(f.MIN_PRELOAD_SEGMENTS):this.setAttribute(f.MIN_PRELOAD_SEGMENTS,`${e}`)}get preferPlayback(){let e=this.getAttribute(f.PREFER_PLAYBACK);if(e===Gt.MSE||e===Gt.NATIVE)return e}set preferPlayback(e){e!==this.preferPlayback&&(e===Gt.MSE||e===Gt.NATIVE?this.setAttribute(f.PREFER_PLAYBACK,e):this.removeAttribute(f.PREFER_PLAYBACK))}get metadata(){var e;return(e=this.media)==null?void 0:e.metadata}set metadata(e){if(Se(this,Te,Ni).call(this),!this.media){st("underlying media element missing when trying to set metadata. metadata will not be set.");return}this.media.metadata=U(U({},ns(this)),e)}get _hlsConfig(){var e;return(e=this.media)==null?void 0:e._hlsConfig}set _hlsConfig(e){if(Se(this,Te,Ni).call(this),!this.media){st("underlying media element missing when trying to set _hlsConfig. _hlsConfig will not be set.");return}this.media._hlsConfig=e}addCuePoints(e){return W(this,null,function*(){var t;if(Se(this,Te,Ni).call(this),!this.media){st("underlying media element missing when trying to addCuePoints. cuePoints will not be added.");return}return(t=this.media)==null?void 0:t.addCuePoints(e)})}get activeCuePoint(){var e;return(e=this.media)==null?void 0:e.activeCuePoint}get cuePoints(){var e,t;return(t=(e=this.media)==null?void 0:e.cuePoints)!=null?t:[]}addChapters(e){var t;if(Se(this,Te,Ni).call(this),!this.media){st("underlying media element missing when trying to addChapters. chapters will not be added.");return}return(t=this.media)==null?void 0:t.addChapters(e)}get activeChapter(){var e;return(e=this.media)==null?void 0:e.activeChapter}get chapters(){var e,t;return(t=(e=this.media)==null?void 0:e.chapters)!=null?t:[]}getStartDate(){var e;return(e=this.media)==null?void 0:e.getStartDate()}get currentPdt(){var e;return(e=this.media)==null?void 0:e.currentPdt}get tokens(){let e=this.getAttribute(w.PLAYBACK_TOKEN),t=this.getAttribute(w.DRM_TOKEN),i=this.getAttribute(w.THUMBNAIL_TOKEN),a=this.getAttribute(w.STORYBOARD_TOKEN);return U(U(U(U(U({},K(this,ql)),e!=null?{playback:e}:{}),t!=null?{drm:t}:{}),i!=null?{thumbnail:i}:{}),a!=null?{storyboard:a}:{})}set tokens(e){rt(this,ql,e!=null?e:{})}get playbackToken(){var e;return(e=this.getAttribute(w.PLAYBACK_TOKEN))!=null?e:void 0}set playbackToken(e){this.setAttribute(w.PLAYBACK_TOKEN,`${e}`)}get drmToken(){var e;return(e=this.getAttribute(w.DRM_TOKEN))!=null?e:void 0}set drmToken(e){this.setAttribute(w.DRM_TOKEN,`${e}`)}get thumbnailToken(){var e;return(e=this.getAttribute(w.THUMBNAIL_TOKEN))!=null?e:void 0}set thumbnailToken(e){this.setAttribute(w.THUMBNAIL_TOKEN,`${e}`)}get storyboardToken(){var e;return(e=this.getAttribute(w.STORYBOARD_TOKEN))!=null?e:void 0}set storyboardToken(e){this.setAttribute(w.STORYBOARD_TOKEN,`${e}`)}addTextTrack(e,t,i,a){var r;let n=(r=this.media)==null?void 0:r.nativeEl;if(n)return Rd(n,e,t,i,a)}removeTextTrack(e){var t;let i=(t=this.media)==null?void 0:t.nativeEl;if(i)return Lg(i,e)}get textTracks(){var e;return(e=this.media)==null?void 0:e.textTracks}get castReceiver(){var e;return(e=this.getAttribute(w.CAST_RECEIVER))!=null?e:void 0}set castReceiver(e){e!==this.castReceiver&&(e?this.setAttribute(w.CAST_RECEIVER,e):this.removeAttribute(w.CAST_RECEIVER))}get castCustomData(){var e;return(e=this.media)==null?void 0:e.castCustomData}set castCustomData(e){if(!this.media){st("underlying media element missing when trying to set castCustomData. castCustomData will not be set.");return}this.media.castCustomData=e}get noTooltips(){return this.hasAttribute(w.NO_TOOLTIPS)}set noTooltips(e){if(!e){this.removeAttribute(w.NO_TOOLTIPS);return}this.setAttribute(w.NO_TOOLTIPS,"")}get proudlyDisplayMuxBadge(){return this.hasAttribute(w.PROUDLY_DISPLAY_MUX_BADGE)}set proudlyDisplayMuxBadge(e){e?this.setAttribute(w.PROUDLY_DISPLAY_MUX_BADGE,""):this.removeAttribute(w.PROUDLY_DISPLAY_MUX_BADGE)}get capRenditionToPlayerSize(){var e;return(e=this.media)==null?void 0:e.capRenditionToPlayerSize}set capRenditionToPlayerSize(e){if(!this.media){st("underlying media element missing when trying to set capRenditionToPlayerSize");return}this.media.capRenditionToPlayerSize=e}get maxReconnectRetries(){var e;return(e=this.media)==null?void 0:e.maxReconnectRetries}set maxReconnectRetries(e){if(!this.media){st("underlying media element missing when trying to set maxReconnectRetries");return}this.media.maxReconnectRetries=e}};Vl=new WeakMap,ss=new WeakMap,ql=new WeakMap,Oa=new WeakMap,Yl=new WeakMap,os=new WeakMap,Gl=new WeakMap,zl=new WeakMap,Kr=new WeakMap,Ql=new WeakMap,Zl=new WeakMap,jl=new WeakMap,ls=new WeakMap,$r=new WeakMap,Xl=new WeakMap,Te=new WeakSet,Ni=function(){var e,t,i,a;if(!K(this,ss)){rt(this,ss,!0),Se(this,Te,Na).call(this);try{if(customElements.upgrade(this.mediaTheme),!(this.mediaTheme instanceof mi.HTMLElement))throw""}catch(r){st("<media-theme> failed to upgrade!")}try{customElements.upgrade(this.media)}catch(r){st("underlying media element failed to upgrade!")}try{if(customElements.upgrade(this.mediaController),!(this.mediaController instanceof o1))throw""}catch(r){st("<media-controller> failed to upgrade!")}Se(this,Te,nf).call(this),Se(this,Te,sf).call(this),Se(this,Te,of).call(this),rt(this,Oa,(t=(e=this.mediaController)==null?void 0:e.hasAttribute(B.USER_INACTIVE))!=null?t:!0),Se(this,Te,lf).call(this),(i=this.media)==null||i.addEventListener("streamtypechange",K(this,Gl)),(a=this.media)==null||a.addEventListener("loadstart",K(this,zl)),this.media&&(this.media.metadata=ns(this))}},rf=function(){var e,t;try{(e=window==null?void 0:window.CSS)==null||e.registerProperty({name:"--media-primary-color",syntax:"<color>",inherits:!0}),(t=window==null?void 0:window.CSS)==null||t.registerProperty({name:"--media-secondary-color",syntax:"<color>",inherits:!0})}catch(i){}},gh=function(e){Object.assign(K(this,$r),e),Se(this,Te,Na).call(this)},Na=function(e={}){Tk(kk(Nk(this,U(U({},K(this,$r)),e))),this.shadowRoot)},nf=function(){let e=t=>{var i,a;if(!(t!=null&&t.startsWith("theme-")))return;let r=t.replace(/^theme-/,"");if(bh.includes(r))return;let n=this.getAttribute(t);n!=null?(i=this.mediaTheme)==null||i.setAttribute(r,n):(a=this.mediaTheme)==null||a.removeAttribute(r)};rt(this,os,new MutationObserver(t=>{for(let{attributeName:i}of t)e(i)})),K(this,os).observe(this,{attributes:!0}),this.getAttributeNames().forEach(e)},sf=function(){var e,t;this.addEventListener("error",K(this,Xl)),this.addEventListener("click",K(this,Ql)),(e=this.mediaTheme)==null||e.addEventListener("close",K(this,Zl)),(t=this.mediaTheme)==null||t.addEventListener("focusin",K(this,jl)),this.media&&(this.media.errorTranslator=(i={})=>{var a,r,n;if(!(((a=this.media)==null?void 0:a.error)instanceof M))return i;let s=Z_((r=this.media)==null?void 0:r.error,!1);return{player_error_code:(n=this.media)==null?void 0:n.error.code,player_error_message:s.message?String(s.message):i.player_error_message,player_error_context:s.context?String(s.context):i.player_error_context}})},of=function(){var e,t,i,a;(t=(e=this.media)==null?void 0:e.textTracks)==null||t.addEventListener("addtrack",K(this,Kr)),(a=(i=this.media)==null?void 0:i.textTracks)==null||a.addEventListener("removetrack",K(this,Kr))},lf=function(){var e,t;if(!/Firefox/i.test(navigator.userAgent))return;let i,a=new WeakMap,r=()=>this.streamType===se.LIVE&&!this.secondaryColor&&this.offsetWidth>=800,n=(c,p,v=!1)=>{r()||Array.from(c&&c.activeCues||[]).forEach(d=>{if(!(!d.snapToLines||d.line<-5||d.line>=0&&d.line<10))if(!p||this.paused){let u=d.text.split(`
`).length,m=-3;this.streamType===se.LIVE&&(m=-2);let _=m-u;if(d.line===_&&!v)return;a.has(d)||a.set(d,d.line),d.line=_}else setTimeout(()=>{d.line=a.get(d)||"auto"},500)})},s=()=>{var c,p;n(i,(p=(c=this.mediaController)==null?void 0:c.hasAttribute(B.USER_INACTIVE))!=null?p:!1)},o=()=>{var c,p;let v=Array.from(((p=(c=this.mediaController)==null?void 0:c.media)==null?void 0:p.textTracks)||[]).filter(d=>["subtitles","captions"].includes(d.kind)&&d.mode==="showing")[0];v!==i&&(i==null||i.removeEventListener("cuechange",s)),i=v,i==null||i.addEventListener("cuechange",s),n(i,K(this,Oa))};o(),(e=this.textTracks)==null||e.addEventListener("change",o),(t=this.textTracks)==null||t.addEventListener("addtrack",o);let l=()=>{var c,p;let v=(p=(c=this.mediaController)==null?void 0:c.hasAttribute(B.USER_INACTIVE))!=null?p:!0;K(this,Oa)!==v&&(rt(this,Oa,v),n(i,K(this,Oa)))};this.addEventListener("userinactivechange",l),rt(this,ls,()=>{var c,p;i==null||i.removeEventListener("cuechange",s),(c=this.textTracks)==null||c.removeEventListener("change",o),(p=this.textTracks)==null||p.removeEventListener("addtrack",o),this.removeEventListener("userinactivechange",l)})};function pi(e,t){return e.media?e.media.getAttribute(t):e.getAttribute(t)}var df=$k,NS,uf=e=>{throw TypeError(e)},cf=(e,t,i)=>t.has(e)||uf("Cannot "+i),Vk=(e,t,i)=>(cf(e,t,"read from private field"),i?i.call(e):t.get(e)),qk=(e,t,i)=>t.has(e)?uf("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,i),Yk=(e,t,i,a)=>(cf(e,t,"write to private field"),a?a.call(e,i):t.set(e,i),i),Jl=class{addEventListener(){}removeEventListener(){}dispatchEvent(e){return!0}};if(typeof DocumentFragment=="undefined"){class e extends Jl{}globalThis.DocumentFragment=e}var yh=class extends Jl{},Gk=class extends Jl{},zk={get(e){},define(e,t,i){},getName(e){return null},upgrade(e){},whenDefined(e){return Promise.resolve(yh)}},ed,Qk=class{constructor(e,t={}){qk(this,ed),Yk(this,ed,t==null?void 0:t.detail)}get detail(){return Vk(this,ed)}initCustomEvent(){}};ed=new WeakMap;function Zk(e,t){return new yh}var hf={document:{createElement:Zk},DocumentFragment,customElements:zk,CustomEvent:Qk,EventTarget:Jl,HTMLElement:yh,HTMLVideoElement:Gk},mf=typeof window=="undefined"||typeof globalThis.customElements=="undefined",Th=mf?hf:globalThis,PS=mf?hf.document:globalThis.document;Th.customElements.get("mux-player")||(Th.customElements.define("mux-player",df),Th.MuxPlayerElement=df);var US=null,pf=parseInt(ve.version)>=19,vf={className:"class",classname:"class",htmlFor:"for",crossOrigin:"crossorigin",viewBox:"viewBox",playsInline:"playsinline",autoPlay:"autoplay",playbackRate:"playbackrate"},jk=e=>e==null,Xk=(e,t)=>jk(t)?!1:e in t,Jk=e=>e.replace(/[A-Z]/g,t=>`-${t.toLowerCase()}`),ew=(e,t)=>{if(!(!pf&&typeof t=="boolean"&&!t)){if(Xk(e,vf))return vf[e];if(typeof t!="undefined")return/[A-Z]/.test(e)?Jk(e):e}},tw=(e,t)=>!pf&&typeof e=="boolean"?"":e,iw=(e={})=>{let a=e,{ref:t}=a,i=Yr(a,["ref"]);return Object.entries(i).reduce((r,[n,s])=>{let o=ew(n,s);if(!o)return r;let l=tw(s,n);return r[o]=l,r},{})};function _f(e,t){if(typeof e=="function")return e(t);e!=null&&(e.current=t)}function aw(...e){return t=>{let i=!1,a=e.map(r=>{let n=_f(r,t);return!i&&typeof n=="function"&&(i=!0),n});if(i)return()=>{for(let r=0;r<a.length;r++){let n=a[r];typeof n=="function"?n():_f(e[r],null)}}}}function rw(...e){return ve.useCallback(aw(...e),e)}var nw=Object.prototype.hasOwnProperty,sw=(e,t)=>{if(Object.is(e,t))return!0;if(typeof e!="object"||e===null||typeof t!="object"||t===null)return!1;if(Array.isArray(e))return!Array.isArray(t)||e.length!==t.length?!1:e.some((r,n)=>t[n]===r);let i=Object.keys(e),a=Object.keys(t);if(i.length!==a.length)return!1;for(let r=0;r<i.length;r++)if(!nw.call(t,i[r])||!Object.is(e[i[r]],t[i[r]]))return!1;return!0},ff=(e,t,i)=>!sw(t,e[i]),ow=(e,t,i)=>{e[i]=t},lw=(e,t,i,a=ow,r=ff)=>(0,ve.useEffect)(()=>{let n=i==null?void 0:i.current;n&&r(n,t,e)&&a(n,t,e)},[i==null?void 0:i.current,t]),vi=lw,dw=()=>{try{return"3.13.2"}catch(e){}return"UNKNOWN"},uw=dw(),cw=()=>uw,Ee=(e,t,i)=>(0,ve.useEffect)(()=>{let a=t==null?void 0:t.current;if(!a||!i)return;let r=e,n=i;return a.addEventListener(r,n),()=>{a.removeEventListener(r,n)}},[t==null?void 0:t.current,i,e]),hw=ve.forwardRef((a,i)=>{var r=a,{children:e}=r,t=Yr(r,["children"]);return ve.createElement("mux-player",da(U({suppressHydrationWarning:!0},iw(t)),{ref:i}),e)}),mw=(e,t)=>{let Be=t,{onAbort:i,onCanPlay:a,onCanPlayThrough:r,onEmptied:n,onLoadStart:s,onLoadedData:o,onLoadedMetadata:l,onProgress:c,onDurationChange:p,onVolumeChange:v,onRateChange:d,onResize:u,onWaiting:m,onPlay:_,onPlaying:y,onTimeUpdate:g,onPause:A,onSeeking:E,onSeeked:T,onStalled:L,onSuspend:I,onEnded:S,onError:H,onCuePointChange:G,onChapterChange:ne,metadata:z,tokens:V,paused:ze,playbackId:ht,playbackRates:mt,currentTime:De,themeProps:ot,extraSourceParams:et,castCustomData:Kt,_hlsConfig:$t}=Be,pt=Yr(Be,["onAbort","onCanPlay","onCanPlayThrough","onEmptied","onLoadStart","onLoadedData","onLoadedMetadata","onProgress","onDurationChange","onVolumeChange","onRateChange","onResize","onWaiting","onPlay","onPlaying","onTimeUpdate","onPause","onSeeking","onSeeked","onStalled","onSuspend","onEnded","onError","onCuePointChange","onChapterChange","metadata","tokens","paused","playbackId","playbackRates","currentTime","themeProps","extraSourceParams","castCustomData","_hlsConfig"]);return vi("tokens",V,e),vi("playbackId",ht,e),vi("playbackRates",mt,e),vi("metadata",z,e),vi("extraSourceParams",et,e),vi("_hlsConfig",$t,e),vi("themeProps",ot,e),vi("castCustomData",Kt,e),vi("paused",ze,e,(Qe,tt)=>{tt!=null&&(tt?Qe.pause():Qe.play())},(Qe,tt,Pi)=>Qe.hasAttribute("autoplay")&&!Qe.hasPlayed?!1:ff(Qe,tt,Pi)),vi("currentTime",De,e,(Qe,tt)=>{tt!=null&&(Qe.currentTime=tt)}),Ee("abort",e,i),Ee("canplay",e,a),Ee("canplaythrough",e,r),Ee("emptied",e,n),Ee("loadstart",e,s),Ee("loadeddata",e,o),Ee("loadedmetadata",e,l),Ee("progress",e,c),Ee("durationchange",e,p),Ee("volumechange",e,v),Ee("ratechange",e,d),Ee("resize",e,u),Ee("waiting",e,m),Ee("play",e,_),Ee("playing",e,y),Ee("timeupdate",e,g),Ee("pause",e,A),Ee("seeking",e,E),Ee("seeked",e,T),Ee("stalled",e,L),Ee("suspend",e,I),Ee("ended",e,S),Ee("error",e,H),Ee("cuepointchange",e,G),Ee("chapterchange",e,ne),[pt]},Ef=cw(),bf="mux-player-react",pw=ve.forwardRef((e,t)=>{var i;let a=(0,ve.useRef)(null),r=rw(a,t),[n]=mw(a,e),[s]=(0,ve.useState)((i=e.playerInitTime)!=null?i:Ss());return ve.createElement(hw,U({ref:r,defaultHiddenCaptions:e.defaultHiddenCaptions,playerSoftwareName:bf,playerSoftwareVersion:Ef,playerInitTime:s},n))}),vw=pw})}]);
}());