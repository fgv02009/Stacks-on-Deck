var CardView = Backbone.View.extend({
  cardDownTemplate: JST['templates/cardDown.jst'],

  initialize: function() {
    //Refactoring IMMINENT
    this.suit = this.model.get('suit');
    this.value = this.model.get('value').toLowerCase();

    this.color = cardColor(this.suit);
    this.cardTemplate = JST['templates/'+ this.value +'.jst'];

    this.listenTo(this.model, "change:faceUp", this.render);
  },

  events: {
    "click": "activateCard",
    "dblclick": "flipCard",
    "doubletap": "flipCard"
  },

  activateCard: function(){
    this.model.setActive();
  },

  render: function(){
    if (this.model.get('faceUp') === true) {
      this.$el.html(this.cardTemplate({color: this.color, suit: "&"+ this.suit +";"}))
    } else {
      this.$el.html(this.cardDownTemplate)
    }
    if (this.model.active) {
      this.$el.addClass("active");
    }
  },

  flipCard: function() {
    console.log("dblclick")
    if (this.model.get('faceUp') === false) {
      this.model.set({faceUp: true})
    } else {
      this.model.set({faceUp: false})
    }
    this.render();
  }
})
