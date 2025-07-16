var socket = io("https://initialresonance.zeabur.app/")
socket.on('connect', function(s) {
  console.log('connect to server!');
})
if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {


  if(window.DeviceOrientationEvent){
    window.addEventListener("deviceorientation", orientation, false);
  }else{
    console.log("DeviceOrientationEvent is not supported");
  }

  function orientation(event){
    vm.accdata={
      gamma:　event.gamma,
      beta:　event.beta,
      alpha:　event.alpha
    }
  }

}

var vm = new Vue({
  el: "#app",
  data: {
    messages: [],
    typing: false,
    userId: (Math.random()).toString(32).slice(2).toUpperCase(),
    temp: {
      message: "",
      name: "路人"
    },
    osc: null,
    activeObjId: -1,
    osc_message: "1",
    osc_address: "/someaddress",
    modes: [
      {name: "生音點滴",eng: "Free Play"},
      {name: "旋律製造所", eng: "Rhythm Factory"}
    ],
    nowModeId: 0,
    noteNames: "C,D,E,F#,G,A,B,C,D,E".split(","),
    accdata: {gamma: 0, beta: 0, alpha: 0}
  },
  mounted() {

    socket.on("allMessage",(obj)=>{
      this.messages=obj
    })
    socket.on("newMessage",(obj)=>{
      console.log("new messages",obj)
      this.messages.push(obj)
    })
    // window.addEventListener("mousemove", function(evt){
    //    socket.emit("mouseMove",{
    //      x: evt.pageX,
    //      y: evt.pageY
    //    })
    // })
    // socket.on("mouseMove",(obj)=>{
    //   $(".ball").css("left",obj.x+"px")
    //   $(".ball").css("top",obj.y+"px")
    // })

    socket.on("typing",(value)=>{
      this.typing = value
    })

    socket.on("osc",(value)=>{
      this.osc = value
      setTimeout(()=>{
        this.osc=""
      },4000)
      if (value.address=="/object"){
        $("[data-object-id="+value.args[0].value+"]").addClass("active")
        setTimeout(()=>{
          $("[data-object-id="+value.args[0].value+"]").removeClass("active")
        },10)
      }

      if (value.address=="/note"){
        $("[data-note-id="+value.args[0].value+"]").addClass("active")
        setTimeout(()=>{
          $("[data-note-id="+value.args[0].value+"]").removeClass("active")
        },10)
      }
      if (value.address=="/hit"){
        $("[data-drum-id="+value.args[0].value+"]").addClass("trigger")
        setTimeout(()=>{
          $("[data-drum-id="+value.args[0].value+"]").removeClass("trigger")
        },10)
      }
    })


  },
  methods: {
    switchMode(delta){
      this.nowModeId = (this.nowModeId+delta + this.modes.length)% this.modes.length
      this.nowModeId = 0
    },
    sendMessage(){
      socket.emit("message",this.temp)
      this.temp.message= ""
    },
    sendType(){
      socket.emit("typing")
    },
    drumHit(){
      socket.emit("hit")
    },
    drumHit2(){
      socket.emit("hit2")

    },
    sendOsc(address,message){
      console.log("emit", address, {value: message});
      socket.emit("osc",{
        address: address,
        args: [
          {value: message}
        ]
      })

    },
    someEvent(){
      socket.emit("osc",{
        address: "/someaddress",
        args: [
          {value: "....."}
        ]
      })
    },
    getSoundName(num){
      return ["Do","Re","Me","Fa","So","La","Si","Do"][num]
    }
  },
  computed: {
    orderedMessages(){
      return this.messages.slice().reverse().slice(0,5)
    },
    nowMode(){
      return this.modes[this.nowModeId]
    }
  },
  watch: {
    accdata(pre,post){
      if (Math.abs(pre.gamma-post.gamma)>50 && pre.gamma > 0 && post.gamma < 0 && !wait){
        wait=true
        this.sendOsc('/object',this.activeObjId);
        setTimeout(function(){
          wait=false
        },300)
      }
    }
  }
})
var wait = false
