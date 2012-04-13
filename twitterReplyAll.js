/*
 * Twitter Reply All
 * Makes it easy to reply to multiple tweeps at once 
 * 
 * *************************************************
 *
 * Mazen A. Melibari
 * mazen@mazen.ws
 * April / 2012
 *
 * *************************************************
 *
 * Developing this extension was tricky due to the isolated world execution environment in Chrome.
 * Replies I wanted to use the same ReplyDialog that twitter.com uses by default instead of developing my own modal window.
 * It’s defined in the namespace: twtter.widget.ReplyDialog. But that namespace isn’t accessible from the extension because of the isolated worlds.
 * I solved this issue by injecting a js code inside the webpage so that it can run in that part of the world!
 */

(function($) {
    
    function addCheckBoxes() {
        $(".js-activity-reply, .js-activity-mention").each(function(index) {
            
            // check whether we have already added a checkbox for this element or not
            if($(this).data("checkboxAdded")==undefined) {
                $(this).data("checkboxAdded", true);
            } else {
                return
            }

            
            var replyUsername = $(".username.js-action-profile-name b", this).text();

            // add the checkbox with all of its events
            $(".stream-item-header", this).prepend(
                $("<img>").addClass("tra-checkboxImg")
                    .data("val", false)
                    .attr("data-username", $.trim(replyUsername))
                    .attr("src", chrome.extension.getURL("checkbox_empty.png")).click(function(e) {
                        // checkboxImg onClick
                        e.stopPropagation();
                        // toggle checkboxImg
                        if($(this).data("val") == true) {
                            $(this).attr("src", chrome.extension.getURL("checkbox_empty.png"));
                        } else {
                            $(this).attr("src", chrome.extension.getURL("checkbox_full.png"));
                        }
                        $(this).data("val", !$(this).data("val"));
                        /*
                         * jQuery doesn't support an easy way to filter elements base on the value of a data attribute
                         * so I just added a psudo class name to reflect wether an element is selected or not
                         */
                        $(this).toggleClass("tra-checkboxImgSelected");

                    }).hover(function(e) {
                        // mouse over checkboxImg
                        $(this).addClass("tra-checkboxImgHover")

                    }, function(e) {
                        // mouse out checkboxImg
                        $(this).removeClass("tra-checkboxImgHover")
                    })
            )
        });
    }

    function init() {
        /* 
         * twitter pages take some time to be fully loaded
         * thus, we have to make sure that the item we're working is ready!
         */
        if($(".js-activity-reply .stream-item-header").length < 1) {
            // the page in not fully loaded yet, call be back later, please!
            setTimeout(init, 500);
            return;
        }

        // the code that's going to be run inside twitter.com webpage 
        function internalCode() {
            $("#global-actions").append(
            	$("<li>").append(
            		'<a href="#" class="tra-actionButton" onclick="doReplyAll()">Reply All</a>'
            	)	
            );

            window.doReplyAll = function(e) {
                var usernames = [];
                var lastTweetId = "";
                var lastScreenName = "";
                $(".tra-checkboxImgSelected").each(function() {
                    var username = $(this).attr("data-username");
                    usernames.push("@" + username);

                    // TODO: a more effiecent way to handle this!
                    lastTweetId = $(this).parent().parent().parent().data("tweet-id");
                    lastScreenName = username;
                });


                var replyTo = usernames.join(" ");
                $(".tra-checkboxImgSelected").last().parent().parent().find("a.js-action-reply")
                        .trigger("click");

                $("textarea.twitter-anywhere-tweet-box-editor").val(replyTo + " ");

                $(".tra-checkboxImgSelected")
                    .removeClass("tra-checkboxImgSelected")
                    .fadeTo('fast', 0.4);
                /*
				var replyBox = new twttr.widget.ReplyDialog(
					{modal: true, draggable: true, multiple: true,
					 template: {
                        footer: "",
                        title: _("Reply All")
                     },
                     data: {
                        component: "stream",
                        input: "click",
                        origin: "tweet-action-reply",
                        screenName: lastScreenName,
                        stream: "ActivityOfMeStream",
                        tweetId: lastTweetId
                     },
                     origin: "tweet-action-reply",
					 defaultContent: replyTo + " "}
				); 
				replyBox.open();
				replyBox.setCaretPosition(0);
                */

                // to prevent default browser behaviour
                return false;
            }
        }

        source = '(' + internalCode + ')();';
        var script = document.createElement('script');
        script.setAttribute("type", "application/javascript");
        script.textContent = source;
        document.body.appendChild(script);
        document.body.removeChild(script);

        addCheckBoxes();
    }

    init();
    $(window).scroll(addCheckBoxes);
})(jQuery);

