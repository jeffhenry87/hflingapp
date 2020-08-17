app.controller('MediaController', ['$rootScope','$scope','$location' ,'HttpService','$window','FlashService', '$modal', '$routeParams', 'MetaService', function( $rootScope,$scope,$location,HttpService,$window,FlashService, $modal, $routeParams, MetaService ){
    var vm = this;

    $scope.diffDate = function(date1) {
      var dateFirst = new Date(date1);
      var dateSecond = new Date();

      // time difference
      var timeDiff = Math.abs(dateSecond.getTime() - dateFirst.getTime());

      // days difference
      return (Math.ceil(timeDiff / (1000 * 3600 * 24)));
    }

    $scope.likePage = function(pageId) {
        if (!$rootScope.user) {
            return alert("You need to be logged in!");
        }
      // Check in the localStorage if this page is already liked
      if (!window.localStorage.getItem(pageId)) {
        // Increment page like by one and save it in the localstorage to avoid additional like
        window.localStorage.setItem(pageId, true);
        HttpService.LikePage(pageId)
        .then(function(response) {
          $scope.pageData.like = $scope.pageData.like + 1;
        });
      }
    }

    $scope.dislikePage = function(pageId) {
        if (!$rootScope.user) {
            return alert("You need to be logged in!");
        }
      // Check in the localStorage if this page is already disliked
      if (!window.localStorage.getItem(pageId)) {
        // Increment page like by one and save it in the localstorage to avoid additional like
        window.localStorage.setItem(pageId, true);
        HttpService.DislikePage(pageId)
        .then(function(response) {
          $scope.pageData.dislike = $scope.pageData.dislike + 1;
        });
      }
    }

    $scope.messageModal = function (){
         $rootScope.modalInstance = $modal.open({
            templateUrl: 'app-view/reply/ReplyView.html'
        });
    }

    $scope.currentPath = $location.absUrl();

    $scope.countries = $rootScope.countryList;
    $scope.states = $rootScope.stateList;
    $scope.regions = $rootScope.regionList;

    $rootScope.savedPreference = $window.localStorage.getItem("healthyfling_preference");

    if ($rootScope.savedPreference == "locked") {
        $rootScope.search.country = $window.localStorage.getItem("healthyfling_preference_country") || "Country";
        $rootScope.search.state = $window.localStorage.getItem("healthyfling_preference_state") || "State";
        $rootScope.search.region = $window.localStorage.getItem("healthyfling_preference_region") || "Region";
        $rootScope.search.category = $window.localStorage.getItem("healthyfling_preference_category") || "Category";
    }

    $scope.savedPreference = ($rootScope.savedPreference == "locked");
    vm.savedPreference = ($rootScope.savedPreference == "locked");

    if ($scope.regions && $scope.regions.indexOf("Region") == -1){
        $scope.regions.unshift("Region");
    }

    $scope.categories = $rootScope.categoryList;

    $scope.changeListInCtrl = function(data){
        if(data != "" && data != undefined && data != "State" && data != "Provinces"){
            $rootScope.regionList = $rootScope.masterList[data];

            $scope.regions = $rootScope.regionList;
            $scope.regions.unshift("Region");
            var temp = $scope.regions;
            $scope.regions = temp.filter(function(item, pos){
              return temp.indexOf(item)== pos;
            });
        }else{
            if (vm.country == "United States" || vm.country == "Canada") {
                $scope.regions = ['Region'];
            }
        }
   };

    $scope.changeStateListInCtrl = function(data){
        if(data != "" && data != undefined && data != "Country"){
            $rootScope.masterList = $rootScope.masterListAll[data];
            $rootScope.stateList = Object.keys($rootScope.masterListAll[data]);
            $scope.states = $rootScope.stateList;
            // $rootScope.regionList = $rootScope.masterListAll[data];

            if (data != "United States" && data != "Canada") {
                $rootScope.regionList = $rootScope.masterList["State"];
                $scope.regions = $rootScope.regionList;
                $scope.regions.unshift("Region");
                var temp = $scope.regions;
                $scope.regions = temp.filter(function(item, pos){
                  return temp.indexOf(item)== pos;
                });
            }else if(data == "Canada"){

                vm.state = "Provinces";
            }
        }else{
            // $scope.regions = ['Region'];
        }
   };

    $rootScope.loading = true;

    $rootScope.adPosts = {};

    // vm.currentPage = 0;
    var path = $location.search();
    vm.currentPage = path.page || 0;
    vm.pageSize = 100;

    vm.country = $rootScope.search.country || "Country";
    vm.state = $rootScope.search.state || "State";
    vm.region = $rootScope.search.region || "Region";
    vm.category = $rootScope.search.category || "Category";

     vm.post = function () {
        $location.path('/post');
    };

    vm.pages = function () {
        vm.dataLoading = true;
        $location.path('/pages');
    };

    vm.login = function () {
        $rootScope.modalInstance = $modal.open({
           templateUrl: 'app-view/login/LoginView.html'
       });
    };

    vm.logout = function () {
        vm.dataLoading = true;

        // remove token from localstorage
        $window.localStorage.removeItem("token");

        $location.path('/');
        window.location.reload();
    };


    vm.lockPreference = function () {
        $window.localStorage.setItem("healthyfling_preference","locked");
        $window.localStorage.setItem("healthyfling_preference_country",vm.country);
        $window.localStorage.setItem("healthyfling_preference_state",vm.state);
        $window.localStorage.setItem("healthyfling_preference_region",vm.region);
        $window.localStorage.setItem("healthyfling_preference_category",vm.category);
        $rootScope.savedPreference = true;
        vm.savedPreference = true;
        $scope.savedPreference = "locked";
        FlashService.Success("Search preference saved for easier browsing.");

    };

    vm.unlockPreference = function () {
        $window.localStorage.setItem("healthyfling_preference","unlocked");

        vm.country = $rootScope.search.country = "Country";
        vm.state = $rootScope.search.state = "State";
        vm.region = $rootScope.search.region = "Region";
        vm.category = $rootScope.search.category = "Category";

        $rootScope.savedPreference = false;
        vm.savedPreference = false;
        $scope.savedPreference = "unlocked";
        FlashService.Success("Search preference has been deleted.");

    };

    vm.search = function () {
        $rootScope.loading = true;
        $rootScope.search.country = this.country;
        $rootScope.search.state = this.state;
        $rootScope.search.region = this.region;
        $rootScope.search.category = this.category;
        $location.path('/search');
    };

    vm.searchFilter = function (country, state,region,category) {
        if(country == 'Country' && state == 'State' && region == 'Region'){

        }else{
            $rootScope.loading = true;
            $rootScope.search.country = country;
            $rootScope.search.state = state;
            $rootScope.search.region = region;
            $rootScope.search.category = category;

            $location.path('/search');
        };
    };


    vm.searchAll = function(){

        $rootScope.savedPreference = $window.localStorage.getItem("healthyfling_preference");

        if ($rootScope.savedPreference == "locked") {
            $rootScope.search.country = $window.localStorage.getItem("healthyfling_preference_country") || "Country";
            $rootScope.search.state = $window.localStorage.getItem("healthyfling_preference_state") || "State";
            $rootScope.search.region = $window.localStorage.getItem("healthyfling_preference_region") || "Region";
            $rootScope.search.category = $window.localStorage.getItem("healthyfling_preference_category") || "Category";

            vm.country = $rootScope.search.country || "Country";
            vm.state = $rootScope.search.state || "State";
            vm.region = $rootScope.search.region || "Region";
            vm.category = $rootScope.search.category || "Category";
        }else{
            vm.country = "Country";
            vm.state = "State";
            vm.region = "Region";
            vm.category = "Category";
            $rootScope.search.country = vm.country;
            $rootScope.search.state = vm.state;
            $rootScope.search.region = vm.region;
            $rootScope.search.category = vm.category;
        }
        $rootScope.loading = true;

        HttpService.GetAllPosts()
        .then(function(response){

            if (response.status == '200') {


                $rootScope.adPosts.data = [];

                for(var i = 0;i<response.data.length;i++){
                    $rootScope.adPosts.data.push(response.data[i]);
                }

                $rootScope.refreshAds();
                $rootScope.loading = false;
            }else{
                vm.dataLoading = false;
                $location.path('/');
                $rootScope.loading = false;
            };

        });
    }

    vm.searchFilter = function (country,state,region,category) {
        if(country == 'Country' && state == 'State' && region == 'Region'){

        }else{
            // $rootScope.loading = true;
            $rootScope.search.country = country;
            vm.country = country;
            $rootScope.search.state = state;
            vm.state = state;
            $rootScope.search.region = region;
            vm.region = region;
            $rootScope.search.category = category;
            vm.category = category;

            this.reloadSearch();
        };
    };

    vm.reloadSearch = function(){
        $rootScope.loading = true;
        HttpService.GetPosts()
        .then(function(response){

            if (response.status == '200') {
                $rootScope.adPosts.data = [];

                for(var i = 0;i<response.data.length;i++){
                    $rootScope.adPosts.data.push(response.data[i]);
                }

                $rootScope.refreshAds();
                $rootScope.loading = false;
            }else{
                vm.dataLoading = false;
                $location.path('/');
                $rootScope.loading = false;
            };

        });
    }

    vm.nextPage = function(){
        vm.currentPage=vm.currentPage+1;

        $location.search('page',vm.currentPage);
    }

    vm.prevPage = function(){
        vm.currentPage=vm.currentPage-1;

        $location.search('page',vm.currentPage);
    }

    $scope.params = $location.search();

    $scope.toggleShareButton = function(){
        if($scope.showShareButtons && $scope.showShareButtons == true){
            $scope.showShareButtons = false;
        }else{
            $scope.showShareButtons = true;
        }
    }

    $scope.initController = function () {
        $rootScope.loading = true;

        HttpService.GetPageWithPosts($routeParams.id)
        .then(function(response){

            // var response = {
            //     "status": 200,
            //     "data": {
            //             "page": {
            //         "subscribers": [
            //             "passp994@gmail.com",
            //             "mas-ood88@hotmail.com"
            //         ],
            //         "like": 3,
            //         "dislike": 0,
            //         "_id": "5d763c243a332e16ae8aa61e",
            //         "title": "Tinas Rants",
            //         "email": "wilsonpatrick578@gmail.com",
            //         "status": "active",
            //         "passcode": "96163750",
            //         "created": "2019-09-09T11:48:52.646Z",
            //         "__v": 2,
            //         "location": "New York, NY",
            //         "website": "",
            //         "profilePic": "https://www.healthyfling.com/processed/imgUploader_1569580550672_female-desire-og-crop.png",
            //         "coverPic": "https://www.healthyfling.com/processed/imgUploader_1569580572476_bf116-11km_r.jpg",
            //         "url": "tinasrants"
            //         },
            //         "posts": [
            //         {
            //             "sharedData": {
            //             "url": "https://www.independent.co.uk/news/world/americas/us-politics/trump-thighland-thailand-speech-ohio-2020-election-video-a9659211.html",
            //             "domain": "WWW.INDEPENDENT.CO.UK",
            //             "title": "Trump mocked after calling Thailand ‘Thighland’ in latest speech blunder",
            //             "description": "President was delivering speech in which he decried corporations sending jobs overseas",
            //             "image": "https://static.independent.co.uk/s3fs-public/thumbnails/image/2020/08/07/11/trump.jpg"
            //             },
            //             "reactions": {
            //             "like": 0,
            //             "love": 0,
            //             "lol": 1,
            //             "wow": 0,
            //             "sad": 0,
            //             "angry": 0
            //             },
            //             "flagreason": [],
            //             "embedSocial": [],
            //             "videoLike": 0,
            //             "videoDislike": 0,
            //             "comments": [],
            //             "subscribers": [],
            //             "like": 0,
            //             "dislike": 0,
            //             "_id": "5f2ea9f06dc997115f9ef20f",
            //             "title": "Trump really said theirs a \"Thigh\" land issue...smh",
            //             "body": "Once again I cant stop laughing from what Trump has said.  This time pronouncing a country with another word.....click the link and see for your self hahahahahah",
            //             "email": "wilsonpatrick578@gmail.com",
            //             "page": "5d763c243a332e16ae8aa61e",
            //             "anonymouscomment": "enabled",
            //             "notified": "no",
            //             "embed": "",
            //             "embedDescription": "",
            //             "files": [],
            //             "status": "active",
            //             "sharedLink": true,
            //             "created": "2020-08-08T13:34:40.803Z",
            //             "__v": 0
            //         },
            //         {
            //             "sharedData": {
            //             "url": "https://www.instagram.com/justsul/",
            //             "domain": "WWW.INSTAGRAM.COM",
            //             "title": "\nLogin • Instagram\n",
            //             "description": "Welcome back to Instagram. Sign in to check out what your friends, family & interests have been capturing & sharing around the world."
            //             },
            //             "reactions": {
            //             "like": 0,
            //             "love": 0,
            //             "lol": 1,
            //             "wow": 0,
            //             "sad": 0,
            //             "angry": 0
            //             },
            //             "flagreason": [],
            //             "embedSocial": [],
            //             "videoLike": 0,
            //             "videoDislike": 0,
            //             "comments": [],
            //             "subscribers": [],
            //             "like": 1,
            //             "dislike": 0,
            //             "_id": "5f2a9e157ad6de0b2010902b",
            //             "title": "Newest Instagram comedy sensation!!",
            //             "body": "I found this random Indian guy from Facebook posting hilarious random clips of different things.  I looked him up and apparently hes big on Instagram.  His name is Just Sul, or at least on his Instagram.  He seems to be from India and is a father.  \n\nHe mainly posts pics of him copying other celebrity poses and skits aswell as parody.  The funniest thing about him compared to everyone else, is his Indian accent.  Check out his page at https://www.instagram.com/justsul/",
            //             "email": "wilsonpatrick578@gmail.com",
            //             "page": "5d763c243a332e16ae8aa61e",
            //             "anonymouscomment": "enabled",
            //             "notified": "no",
            //             "embed": "https://www.youtube.com/watch?v=C7F80Hy-qrg",
            //             "embedDescription": "",
            //             "files": [
            //             {
            //                 "tags": [],
            //                 "like": 0,
            //                 "dislike": 2,
            //                 "_id": "5f2a9e157ad6de0b2010902c",
            //                 "secure_url": "https://www.healthyfling.com/processed/imgURL_1596628501336_just-sul-tomatoheart-5-696x696.jpg",
            //                 "signature": ""
            //             },
            //             {
            //                 "tags": [],
            //                 "like": 0,
            //                 "dislike": 0,
            //                 "_id": "5f2a9e157ad6de0b2010902d",
            //                 "secure_url": "https://www.healthyfling.com/processed/imgURL_1596628501349_dnaovgvxoaaelqm.jpg",
            //                 "signature": ""
            //             },
            //             {
            //                 "tags": [],
            //                 "like": 0,
            //                 "dislike": 0,
            //                 "_id": "5f2a9e167ad6de0b2010902e",
            //                 "secure_url": "https://www.healthyfling.com/processed/imgURL_1596628501350_6ix9ine-vs-7even11even-fresh-styles-dab-32007727.png",
            //                 "signature": ""
            //             }
            //             ],
            //             "status": "active",
            //             "sharedLink": true,
            //             "created": "2020-08-05T11:55:01.316Z",
            //             "__v": 0
            //         },
            //         {
            //             "sharedData": {
            //             "url": "https://www.youtube.com/watch?v=-1zS-2F3pNw",
            //             "domain": "WWW.YOUTUBE.COM",
            //             "title": "Deavan's Translator Creates More Problems | 90 Day Fiancé: The Other Way",
            //             "description": "Deavan and Jihoon struggle to communicate with Jihoon's parents and the translator isn't helping the situation. Stream Full Episodes of 90 Day Fiancé: The Ot...",
            //             "image": "https://i.ytimg.com/vi/-1zS-2F3pNw/maxresdefault.jpg"
            //             },
            //             "reactions": {
            //             "like": 0,
            //             "love": 0,
            //             "lol": 1,
            //             "wow": 0,
            //             "sad": 0,
            //             "angry": 0
            //             },
            //             "flagreason": [],
            //             "embedSocial": [],
            //             "videoLike": 0,
            //             "videoDislike": 0,
            //             "comments": [
            //             "5f27e698648b313efff6863b"
            //             ],
            //             "subscribers": [],
            //             "like": 0,
            //             "dislike": 0,
            //             "_id": "5f1c21c3b048225afe1c1d90",
            //             "title": "When your translater completely does the opposite of what you say lol",
            //             "body": "So for those of us who watch 90 Day Fiance on TLC, there was a segment where a couple had to use a translation device since one spoke English and the other another language.  Well towards the end, the device completely said the opposite of what the guy said and its completely hilarious.  Watch the video and see!\n\nhttps://www.youtube.com/watch?v=-1zS-2F3pNw",
            //             "email": "wilsonpatrick578@gmail.com",
            //             "page": "5d763c243a332e16ae8aa61e",
            //             "anonymouscomment": "enabled",
            //             "notified": "no",
            //             "embed": "https://www.youtube.com/watch?v=-1zS-2F3pNw",
            //             "embedDescription": "",
            //             "status": "active",
            //             "sharedLink": true,
            //             "created": "2020-07-25T12:12:51.333Z",
            //             "files": [
            //             {
            //                 "tags": [],
            //                 "like": 1,
            //                 "dislike": 0,
            //                 "_id": "5f1c21c3b048225afe1c1d91",
            //                 "signature": "",
            //                 "secure_url": "https://www.healthyfling.com/processed/imgURL_1595679171367_maxresdefault.jpg"
            //             }
            //             ],
            //             "__v": 1
            //         },
            //         {
            //             "reactions": {
            //             "like": 0,
            //             "love": 0,
            //             "lol": 1,
            //             "wow": 0,
            //             "sad": 0,
            //             "angry": 0
            //             },
            //             "flagreason": [],
            //             "embedSocial": [],
            //             "videoLike": 0,
            //             "videoDislike": 0,
            //             "comments": [
            //             "5f27e83d648b313efff6863e"
            //             ],
            //             "subscribers": [],
            //             "like": 0,
            //             "dislike": 0,
            //             "_id": "5f17be19b048225afe1c1d80",
            //             "title": "First look at Nicki Minajs pregnancy pics",
            //             "body": "If this isnt the most bizarre pics.  Nothing natural about this.",
            //             "email": "wilsonpatrick578@gmail.com",
            //             "page": "5d763c243a332e16ae8aa61e",
            //             "anonymouscomment": "enabled",
            //             "notified": "no",
            //             "embed": "",
            //             "embedDescription": "",
            //             "status": "active",
            //             "created": "2020-07-22T04:18:33.321Z",
            //             "files": [
            //             {
            //                 "tags": [],
            //                 "like": 0,
            //                 "dislike": 0,
            //                 "secure_url": "https://www.healthyfling.com/processed/imgURL_1595391513337_nicki-minaj-baby-bump-pregnant.jpg",
            //                 "signature": "",
            //                 "_id": "5f1801a5b048225afe1c1d87"
            //             },
            //             {
            //                 "tags": [],
            //                 "like": 0,
            //                 "dislike": 0,
            //                 "secure_url": "https://www.healthyfling.com/processed/imgURL_1595391513333_26a4ca4f1339a6dc00bf0f03ac8a4057e436af07.png",
            //                 "signature": "",
            //                 "_id": "5f1801a5b048225afe1c1d86"
            //             }
            //             ],
            //             "__v": 2
            //         },
            //         {
            //             "sharedData": {
            //             "url": "https://www.dailymail.co.uk/news/article-8429643/Donald-Trump-looking-sue-niece-Mary-tell-book-signed-NDA.html",
            //             "domain": "WWW.DAILYMAIL.CO.UK",
            //             "title": "Donald Trump is 'looking to sue his niece Mary' over her tell-all book",
            //             "description": "Mary Trump, right, will release 'Too Much and Never Enough: How My Family Created the World's Most Dangerous Man,' on July 28, according to her publisher. Trump is left.",
            //             "image": "https://i.dailymail.co.uk/1s/2020/06/17/05/29699158-0-image-a-34_1592369745168.jpg"
            //             },
            //             "reactions": {
            //             "like": 1,
            //             "love": 0,
            //             "lol": 1,
            //             "wow": 0,
            //             "sad": 0,
            //             "angry": 0
            //             },
            //             "flagreason": [],
            //             "embedSocial": [],
            //             "videoLike": 0,
            //             "videoDislike": 0,
            //             "comments": [
            //             "5eeba0f8fba18f57d38c4cf6",
            //             "5eefed34fba18f57d38c4cf7",
            //             "5ef1acc8d76a85189e03f2e7",
            //             "5ef1b11cd76a85189e03f2e8"
            //             ],
            //             "subscribers": [],
            //             "like": 0,
            //             "dislike": 0,
            //             "_id": "5ee9f64dad3a3a5209199cca",
            //             "title": "Donald Trump has a niece whose a Clinical Psychologist?",
            //             "body": "He made his whole family sign an NDA....does he have something to hide?",
            //             "email": "wilsonpatrick578@gmail.com",
            //             "page": "5d763c243a332e16ae8aa61e",
            //             "anonymouscomment": "enabled",
            //             "notified": "no",
            //             "embed": "",
            //             "embedDescription": "",
            //             "status": "active",
            //             "sharedLink": true,
            //             "created": "2020-06-17T10:54:05.975Z",
            //             "files": [],
            //             "__v": 0
            //         },
            //         {
            //             "reactions": {
            //             "like": 0,
            //             "love": 1,
            //             "lol": 0,
            //             "wow": 0,
            //             "sad": 0,
            //             "angry": 0
            //             },
            //             "flagreason": [],
            //             "embedSocial": [],
            //             "videoLike": 0,
            //             "videoDislike": 0,
            //             "comments": [],
            //             "subscribers": [],
            //             "like": 0,
            //             "dislike": 0,
            //             "_id": "5edf131f68025f0a1826d01e",
            //             "title": "CNN anchor Chris Como strolls naked in his wifes Yoga video",
            //             "body": "Its no surprise that CNNs Chris Cuomo is into fitness.  I mean the mans buff.  And his family is into fitness too especially his wife also.\n\nHis wife was recently doing a Yoga video when a naked Chris can be seen walking naked holding his phone in the backyard of their Hampton, NY residende.\n\nThe video was posted in the end of May and was quickly removed when his wife became aware.  Not gonna lie, Chris has a body to flaunt.  Now persoanlity...not sure.",
            //             "email": "wilsonpatrick578@gmail.com",
            //             "page": "5d763c243a332e16ae8aa61e",
            //             "anonymouscomment": "enabled",
            //             "notified": "no",
            //             "embed": "",
            //             "embedDescription": "",
            //             "status": "active",
            //             "created": "2020-06-09T04:42:07.512Z",
            //             "files": [
            //             {
            //                 "tags": [],
            //                 "like": 0,
            //                 "dislike": 0,
            //                 "secure_url": "https://www.healthyfling.com/processed/imgUploader_1591677857276_chris-cuomo-naked.webp",
            //                 "signature": "Not much to see but his backside",
            //                 "_id": "5edf13c368025f0a1826d01f"
            //             },
            //             {
            //                 "tags": [],
            //                 "like": 0,
            //                 "dislike": 0,
            //                 "_id": "5edf13c368025f0a1826d020",
            //                 "signature": "He definitely works out",
            //                 "secure_url": "https://www.healthyfling.com/processed/imgURL_1591677891703_cuomo.jpg"
            //             }
            //             ],
            //             "__v": 1
            //         },
            //         {
            //             "sharedData": {
            //             "url": "https://www.youtube.com/watch?v=qxLE0lls23o",
            //             "domain": "WWW.YOUTUBE.COM",
            //             "title": "Robocop - Movie Clip #2 - \"Thank You\" (1987)",
            //             "description": " ",
            //             "image": "https://i.ytimg.com/vi/qxLE0lls23o/maxresdefault.jpg"
            //             },
            //             "reactions": {
            //             "like": 1,
            //             "love": 0,
            //             "lol": 0,
            //             "wow": 0,
            //             "sad": 0,
            //             "angry": 0
            //             },
            //             "flagreason": [],
            //             "embedSocial": [],
            //             "videoLike": 0,
            //             "videoDislike": 0,
            //             "comments": [],
            //             "subscribers": [],
            //             "like": 0,
            //             "dislike": 0,
            //             "_id": "5ed7a91c80668224b5382fbe",
            //             "title": "What if Robocop was real in 2020",
            //             "body": "With all this protest and violence going on, I cant help but wonder what if humans would have  actually created a real Robocop.  Not one but a few of them.  Where there still be police brutality?  Would riots still happen?  Would there be rise of the machines...etc.\n\nI guess this quarantine still gots a person the thinkin!!!",
            //             "email": "wilsonpatrick578@gmail.com",
            //             "page": "5d763c243a332e16ae8aa61e",
            //             "anonymouscomment": "enabled",
            //             "notified": "no",
            //             "embed": "https://www.youtube.com/watch?v=qxLE0lls23o",
            //             "embedDescription": "",
            //             "status": "active",
            //             "sharedLink": true,
            //             "created": "2020-06-03T13:43:56.004Z",
            //             "files": [
            //             {
            //                 "tags": [],
            //                 "like": 0,
            //                 "dislike": 0,
            //                 "_id": "5ed7a91c80668224b5382fbf",
            //                 "signature": "",
            //                 "secure_url": "https://www.healthyfling.com/processed/imgURL_1591191836092_91jlxqdqp5l._sl1500_.jpg"
            //             },
            //             {
            //                 "tags": [],
            //                 "like": 0,
            //                 "dislike": 0,
            //                 "_id": "5ed7a91c80668224b5382fc0",
            //                 "signature": "",
            //                 "secure_url": "https://www.healthyfling.com/processed/imgURL_1591191836094_robocop-returns.jpg"
            //             },
            //             {
            //                 "tags": [],
            //                 "like": 0,
            //                 "dislike": 0,
            //                 "_id": "5ed7a91c80668224b5382fc1",
            //                 "signature": "",
            //                 "secure_url": "https://www.healthyfling.com/processed/imgURL_1591191836089_robocop.png"
            //             }
            //             ],
            //             "__v": 0
            //         },
            //         {
            //             "reactions": {
            //             "like": 0,
            //             "love": 0,
            //             "lol": 1,
            //             "wow": 0,
            //             "sad": 0,
            //             "angry": 0
            //             },
            //             "flagreason": [],
            //             "embedSocial": [],
            //             "videoLike": 0,
            //             "videoDislike": 0,
            //             "comments": [
            //             "5ed4066680668224b5382fb1"
            //             ],
            //             "subscribers": [],
            //             "like": 0,
            //             "dislike": 0,
            //             "_id": "5ed3727e38d69a1e41b6b32a",
            //             "title": "The real definition of the name \"Karen\"",
            //             "body": "The name Karen has been poping up allot lately.  Well I finally figured out what it really means thanks to Always Sunny in Philly.  Just look at the pic!",
            //             "email": "wilsonpatrick578@gmail.com",
            //             "page": "5d763c243a332e16ae8aa61e",
            //             "anonymouscomment": "enabled",
            //             "notified": "no",
            //             "embed": "https://www.youtube.com/watch?v=3J6urFp8YZ0",
            //             "embedDescription": "interesting dance",
            //             "status": "active",
            //             "created": "2020-05-31T09:01:50.954Z",
            //             "files": [
            //             {
            //                 "tags": [],
            //                 "like": 0,
            //                 "dislike": 0,
            //                 "secure_url": "https://www.healthyfling.com/processed/imgUploader_1590915392983_dsbuffer.bmp.png",
            //                 "signature": "Always sunny in Philly Karen episode",
            //                 "_id": "5ed3808c48585f237dd25297"
            //             },
            //             {
            //                 "tags": [],
            //                 "like": 0,
            //                 "dislike": 0,
            //                 "_id": "5ed3808c48585f237dd25298",
            //                 "signature": "Karen Definition",
            //                 "secure_url": "https://www.healthyfling.com/processed/imgURL_1590919308109_d5iffay.jpg"
            //             }
            //             ],
            //             "__v": 1
            //         },
            //         {
            //             "sharedData": {
            //             "url": "https://www.dailymail.co.uk/tvshowbiz/article-8369681/Kylie-Jenner-no-longer-billionaire-according-Forbes.html",
            //             "domain": "WWW.DAILYMAIL.CO.UK",
            //             "title": "Kylie Jenner is no longer a billionaire according to Forbes",
            //             "description": "In a detailed report based on public financial disclosures, Forbes on Friday accused the family of creating a 'web of lies' and says Kylie, 22, has inflated the size of her business and success.",
            //             "image": "https://i.dailymail.co.uk/1s/2020/05/29/14/28973974-0-image-a-57_1590759785343.jpg"
            //             },
            //             "reactions": {
            //             "like": 0,
            //             "love": 0,
            //             "lol": 1,
            //             "wow": 1,
            //             "sad": 0,
            //             "angry": 0
            //             },
            //             "flagreason": [],
            //             "embedSocial": [],
            //             "videoLike": 0,
            //             "videoDislike": 0,
            //             "comments": [
            //             "5ed1ec9d2e76d73e0058a616"
            //             ],
            //             "subscribers": [],
            //             "like": 0,
            //             "dislike": 0,
            //             "_id": "5ed198f882dc333999d57dd6",
            //             "title": "Kylie is a false billionaire!!",
            //             "body": "Looks like Kylie and her mom lied about their sales.  Her net worth, according to Forebs is around 900 million after she sold 50 percent of Kylie cosmetics to a public company. \n\nNo response yet!!!",
            //             "email": "wilsonpatrick578@gmail.com",
            //             "page": "5d763c243a332e16ae8aa61e",
            //             "anonymouscomment": "enabled",
            //             "notified": "no",
            //             "embed": "https://www.youtube.com/watch?v=QTLagMLPJdU",
            //             "embedDescription": "",
            //             "status": "active",
            //             "sharedLink": true,
            //             "created": "2020-05-29T23:21:28.482Z",
            //             "files": [],
            //             "__v": 0
            //         },
            //         {
            //             "reactions": {
            //             "like": 0,
            //             "love": 0,
            //             "lol": 0,
            //             "wow": 0,
            //             "sad": 0,
            //             "angry": 0
            //             },
            //             "flagreason": [],
            //             "embedSocial": [],
            //             "videoLike": 0,
            //             "videoDislike": 0,
            //             "comments": [],
            //             "subscribers": [],
            //             "like": 0,
            //             "dislike": 0,
            //             "_id": "5ece3a70d5ee3223a48ed85e",
            //             "title": "What a smart dog!",
            //             "body": "Someone trained their dog to pee in a toilet.  Super hilarious with the fart at the end..haha",
            //             "email": "wilsonpatrick578@gmail.com",
            //             "page": "5d763c243a332e16ae8aa61e",
            //             "anonymouscomment": "enabled",
            //             "notified": "no",
            //             "embed": "<iframe width=\"640\" height=\"360\" xxx=\"https://www.worldstarhiphop.com/embed/151839\" frameborder=\"0\" allowfullscreen></iframe>",
            //             "embedDescription": "",
            //             "status": "active",
            //             "created": "2020-05-27T10:01:20.252Z",
            //             "files": [],
            //             "__v": 0
            //         },
            //         {
            //             "reactions": {
            //             "like": 0,
            //             "love": 0,
            //             "lol": 0,
            //             "wow": 0,
            //             "sad": 0,
            //             "angry": 0
            //             },
            //             "flagreason": [],
            //             "embedSocial": [],
            //             "videoLike": 0,
            //             "videoDislike": 0,
            //             "comments": [],
            //             "subscribers": [],
            //             "like": 0,
            //             "dislike": 0,
            //             "_id": "5ecc17f6f44640154e33072f",
            //             "title": "So hungry!!!",
            //             "body": "Why is there a long line at In N Out!!!!",
            //             "email": "wilsonpatrick578@gmail.com",
            //             "page": "5d763c243a332e16ae8aa61e",
            //             "anonymouscomment": "enabled",
            //             "notified": "no",
            //             "embed": "",
            //             "embedDescription": "",
            //             "status": "active",
            //             "created": "2020-05-25T19:09:42.264Z",
            //             "files": [],
            //             "__v": 0
            //         },
            //         {
            //             "reactions": {
            //             "like": 1,
            //             "love": 1,
            //             "lol": 0,
            //             "wow": 1,
            //             "sad": 0,
            //             "angry": 0
            //             },
            //             "flagreason": [
            //             "Child pornograpy and or endangerment"
            //             ],
            //             "embedSocial": [],
            //             "videoLike": 0,
            //             "videoDislike": 0,
            //             "comments": [],
            //             "subscribers": [],
            //             "like": 1,
            //             "dislike": 1,
            //             "_id": "5ec5386691643d64bb8d0bf8",
            //             "title": "Muscle nurse who got Covid 19 shows dramatic weight loss",
            //             "body": "Mike Schultz, 43, was only released from a Massachusetts hospital last week after spending 57 days battling coronavirus-induced pneumonia .\n\nSchultz posted a photo on Instagram last week to show just how much the virus has ravaged his body.\n\nAfter contracting the virus in mid-March, Schultz said he became so weak he was unable to hold his cellphone in one hand.\n\nA week before getting sick, Schultz was at a festival in Miami with his boyfriend.",
            //             "email": "wilsonpatrick578@gmail.com",
            //             "page": "5d763c243a332e16ae8aa61e",
            //             "anonymouscomment": "disabled",
            //             "notified": "no",
            //             "embed": "",
            //             "embedDescription": "",
            //             "status": "flagged",
            //             "created": "2020-05-20T14:02:14.161Z",
            //             "files": [
            //             {
            //                 "tags": [],
            //                 "like": 0,
            //                 "dislike": 0,
            //                 "_id": "5ec5386691643d64bb8d0bf9",
            //                 "signature": "Before contracting covid 19",
            //                 "secure_url": "https://www.healthyfling.com/processed/imgURL_1589983334171_28616726-8339925-image-m-14_1589977196909.jpg"
            //             },
            //             {
            //                 "tags": [],
            //                 "like": 0,
            //                 "dislike": 0,
            //                 "_id": "5ec5386691643d64bb8d0bfa",
            //                 "signature": "After contracting Covid 19",
            //                 "secure_url": "https://www.healthyfling.com/processed/imgURL_1589983334174_28616726-8339925-image-m-12_1589977180555.jpg"
            //             },
            //             {
            //                 "tags": [],
            //                 "like": 0,
            //                 "dislike": 0,
            //                 "_id": "5ec5386691643d64bb8d0bfb",
            //                 "signature": "",
            //                 "secure_url": "https://www.healthyfling.com/processed/imgURL_1589983334176_28616724-8339925-image-m-16_1589977309866.jpg"
            //             },
            //             {
            //                 "tags": [],
            //                 "like": 0,
            //                 "dislike": 0,
            //                 "_id": "5ec5386691643d64bb8d0bfc",
            //                 "signature": "",
            //                 "secure_url": "https://www.healthyfling.com/processed/imgURL_1589983334178_28617084-8339925-prior_to_falling_ill_schultz_weighed_about_190_pounds_would_work-m-18_1589977374830.jpg"
            //             }
            //             ],
            //             "__v": 0
            //         },
            //         {
            //             "reactions": {
            //             "like": 0,
            //             "love": 0,
            //             "lol": 0,
            //             "wow": 0,
            //             "sad": 0,
            //             "angry": 0
            //             },
            //             "flagreason": [],
            //             "embedSocial": [],
            //             "videoLike": 0,
            //             "videoDislike": 0,
            //             "comments": [],
            //             "subscribers": [],
            //             "like": 0,
            //             "dislike": 0,
            //             "_id": "5ec5173691643d64bb8d0bf5",
            //             "title": "Nancy Pelosi called Trump \"Morbidly Obese\" live on TV",
            //             "body": "Just when you think politics cant get any more shadier, it just continues and gets funnier.  In a recent interview with Anderson Cooper on CNN, Nancy Pelosi eluded that a person in his age range and weight status shouldn't take a drug thats not approved by the FDA.  She then goes on to mention that he is \"morbidly obese\".  Way too funny!",
            //             "email": "wilsonpatrick578@gmail.com",
            //             "page": "5d763c243a332e16ae8aa61e",
            //             "anonymouscomment": "enabled",
            //             "notified": "no",
            //             "embed": "<iframe width=\"560\" height=\"315\" xxx=\"https://www.youtube.com/embed/zXsCWm6CW5A\" frameborder=\"0\" allow=\"accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen></iframe>",
            //             "embedDescription": "",
            //             "status": "active",
            //             "created": "2020-05-20T11:40:38.448Z",
            //             "files": [
            //             {
            //                 "tags": [],
            //                 "like": 0,
            //                 "dislike": 0,
            //                 "_id": "5ec5173691643d64bb8d0bf6",
            //                 "signature": "",
            //                 "secure_url": "https://www.healthyfling.com/processed/imgURL_1589974838457_anderson-cooper-nancy-pelosi-yt-2.jpg"
            //             }
            //             ],
            //             "__v": 0
            //         },
            //         {
            //             "reactions": {
            //             "like": 0,
            //             "love": 0,
            //             "lol": 0,
            //             "wow": 1,
            //             "sad": 0,
            //             "angry": 0
            //             },
            //             "flagreason": [],
            //             "embedSocial": [],
            //             "videoLike": 0,
            //             "videoDislike": 0,
            //             "comments": [],
            //             "subscribers": [],
            //             "like": 0,
            //             "dislike": 0,
            //             "_id": "5ebfd1e51d4c347b1c9b0080",
            //             "title": "California biotech company claims it has discovered an antibody that can block 100% of Corona Virus",
            //             "body": "Why wait for a vaccine when a therapeutics company called, Sorrento, based in California has discovered an anti body that can completely block the corona virus. \n\nScientists with the company are calling it a 'cure' and say the antibody could be used to make a treatment months before a vaccine is available. \n\nUp to 200,000 doses could be made a month while Sorrento awaits FDA approval for the drug .",
            //             "email": "wilsonpatrick578@gmail.com",
            //             "page": "5d763c243a332e16ae8aa61e",
            //             "anonymouscomment": "enabled",
            //             "notified": "no",
            //             "embed": "",
            //             "embedDescription": "",
            //             "status": "active",
            //             "created": "2020-05-16T11:43:33.148Z",
            //             "files": [
            //             {
            //                 "tags": [],
            //                 "like": 0,
            //                 "dislike": 0,
            //                 "_id": "5ebfd1e51d4c347b1c9b0081",
            //                 "signature": "",
            //                 "secure_url": "https://www.healthyfling.com/processed/imgURL_1589629413167_28444140-8324395-amid_the_pandemic_scientists_at_sorrento_began_testing_its_libra-a-77_1589576078582.jpg"
            //             },
            //             {
            //                 "tags": [],
            //                 "like": 0,
            //                 "dislike": 0,
            //                 "_id": "5ebfd1e51d4c347b1c9b0082",
            //                 "signature": "Stocks for Sorrento surged nearly 220% on the heels of its announcement",
            //                 "secure_url": "https://www.healthyfling.com/processed/imgURL_1589629413169_28442390-8324395-image-a-19_1589567014581.jpg"
            //             },
            //             {
            //                 "tags": [],
            //                 "like": 0,
            //                 "dislike": 0,
            //                 "_id": "5ebfd1e51d4c347b1c9b0083",
            //                 "signature": "Sorrento headquarters in California",
            //                 "secure_url": "https://www.healthyfling.com/processed/imgURL_1589629413165_28444138-8324395-san_diego_based_sorrento_said_it_can_start_making_200_00_doses_o-a-73_1589576078499.jpg"
            //             }
            //             ],
            //             "__v": 0
            //         },
            //         {
            //             "reactions": {
            //             "like": 0,
            //             "love": 0,
            //             "lol": 0,
            //             "wow": 0,
            //             "sad": 0,
            //             "angry": 0
            //             },
            //             "flagreason": [],
            //             "embedSocial": [],
            //             "videoLike": 0,
            //             "videoDislike": 0,
            //             "comments": [],
            //             "subscribers": [],
            //             "like": 0,
            //             "dislike": 0,
            //             "_id": "5ebe88251d4c347b1c9b007d",
            //             "title": "Goldie Hawn, 74, Dances Up A Storm To ‘Let’s Get Physical’ In Trampoline Workout Video",
            //             "body": "For someone in their 70s, you would think their either dead or close to it.  Not Goldie Hawn.  At age 74 she still manages to kick in a workout.  A side note, her famous daughter promotes leggings and is into health which I think got Goldie into it.\n\nCheck out the trampoline workout she posted on her Instagram.  Pretty inspirational!",
            //             "email": "wilsonpatrick578@gmail.com",
            //             "page": "5d763c243a332e16ae8aa61e",
            //             "anonymouscomment": "enabled",
            //             "notified": "no",
            //             "embed": "<iframe width=\"560\" height=\"315\" xxx=\"https://www.youtube.com/embed/m22MtyjOGZU\" frameborder=\"0\" allow=\"accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen></iframe>",
            //             "embedDescription": "",
            //             "status": "active",
            //             "created": "2020-05-15T12:16:37.153Z",
            //             "files": [
            //             {
            //                 "tags": [],
            //                 "like": 0,
            //                 "dislike": 0,
            //                 "_id": "5ebe88251d4c347b1c9b007e",
            //                 "signature": "",
            //                 "secure_url": "https://www.healthyfling.com/processed/imgURL_1589544997164_hawn.jpg"
            //             }
            //             ],
            //             "__v": 0
            //         },
            //         {
            //             "sharedData": {
            //             "url": "https://www.dailymail.co.uk/femail/article-8312997/Twitter-goes-wild-birthday-lawn-sign-accidentally-says-ORGY.html",
            //             "domain": "WWW.DAILYMAIL.CO.UK",
            //             "title": "Twitter goes wild over birthday lawn sign that accidentally says ORGY",
            //             "description": "A Twitter user named Sara shared a photo of the cringe-worthy tribute for the teen on Sunday, explaining that her brother is neighbors with the family.",
            //             "image": "https://i.dailymail.co.uk/1s/2020/05/12/21/28318392-0-image-a-112_1589317097858.jpg"
            //             },
            //             "reactions": {
            //             "like": 0,
            //             "love": 0,
            //             "lol": 0,
            //             "wow": 0,
            //             "sad": 0,
            //             "angry": 0
            //             },
            //             "flagreason": [],
            //             "embedSocial": [],
            //             "videoLike": 0,
            //             "videoDislike": 0,
            //             "comments": [],
            //             "subscribers": [],
            //             "like": 0,
            //             "dislike": 0,
            //             "_id": "5ebbfba51d4c347b1c9b0074",
            //             "title": "Too Funny:  A birthday lawn sign was accidentally made to look like an orgy advertisement",
            //             "body": "A family quarantining, wanted to tell everyone about their daughters 18th birthday.  Instead of a gathering, they decided to put up a yard sign for everyone in their neighborhood to know.  Instead the yard sign was made to assume that there was going to be an orgy for the 18+.  \n\nThis happened because certain words in the persons name was not bolded.  Instead of \"Morgyn\" it looked like \"Orgy\" with the 18 and a cross by it.  Super funny.  Still not sure why people spell Morgan like Morgyn.  The why doesnt help!",
            //             "email": "wilsonpatrick578@gmail.com",
            //             "page": "5d763c243a332e16ae8aa61e",
            //             "anonymouscomment": "enabled",
            //             "notified": "no",
            //             "embed": "",
            //             "embedDescription": "",
            //             "status": "active",
            //             "sharedLink": true,
            //             "created": "2020-05-13T13:52:37.908Z",
            //             "files": [
            //             {
            //                 "tags": [],
            //                 "like": 0,
            //                 "dislike": 0,
            //                 "_id": "5ebbfba61d4c347b1c9b0075",
            //                 "signature": "Yard sign with misleading title",
            //                 "secure_url": "https://www.healthyfling.com/processed/imgURL_1589377957939_28318080-8312997-image-m-79_1589316469405.jpg"
            //             },
            //             {
            //                 "tags": [],
            //                 "like": 0,
            //                 "dislike": 0,
            //                 "_id": "5ebbfba61d4c347b1c9b0076",
            //                 "signature": "Someone sharing the same image on Twitter",
            //                 "secure_url": "https://www.healthyfling.com/processed/imgURL_1589377957942_28318078-8312997-image-a-80_1589316492373.jpg"
            //             }
            //             ],
            //             "__v": 0
            //         },
            //         {
            //             "reactions": {
            //             "like": 0,
            //             "love": 0,
            //             "lol": 2,
            //             "wow": 0,
            //             "sad": 0,
            //             "angry": 0
            //             },
            //             "flagreason": [],
            //             "embedSocial": [],
            //             "videoLike": 0,
            //             "videoDislike": 0,
            //             "comments": [
            //             "5eba1b6b1d4c347b1c9b006c"
            //             ],
            //             "subscribers": [],
            //             "like": 0,
            //             "dislike": 0,
            //             "_id": "5eb938ce1d4c347b1c9b0062",
            //             "title": "Female rapper Tekashi 69 shows off new hair and boyfriend",
            //             "body": "Now that hes out, Daniel is showing allot of things.  His music, look, and significant other.  Tekashi shared a clip of his new locks and his new beau.  Congrats on the new relationship!",
            //             "email": "wilsonpatrick578@gmail.com",
            //             "page": "5d763c243a332e16ae8aa61e",
            //             "anonymouscomment": "enabled",
            //             "notified": "no",
            //             "embed": "<iframe width=\"560\" height=\"315\" xxx=\"https://www.youtube.com/embed/RDym9alo39I\" frameborder=\"0\" allow=\"accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen></iframe>",
            //             "embedDescription": "",
            //             "status": "active",
            //             "created": "2020-05-11T11:36:46.854Z",
            //             "files": [
            //             {
            //                 "tags": [],
            //                 "like": 0,
            //                 "dislike": 0,
            //                 "_id": "5eb938ce1d4c347b1c9b0063",
            //                 "signature": "",
            //                 "secure_url": "https://www.healthyfling.com/processed/imgURL_1589197006858_tekashi-6ix9ine-selfie-clip-759x500.jpg"
            //             }
            //             ],
            //             "__v": 0
            //         },
            //         {
            //             "reactions": {
            //             "like": 0,
            //             "love": 0,
            //             "lol": 1,
            //             "wow": 0,
            //             "sad": 0,
            //             "angry": 0
            //             },
            //             "flagreason": [],
            //             "embedSocial": [],
            //             "videoLike": 0,
            //             "videoDislike": 0,
            //             "comments": [],
            //             "subscribers": [],
            //             "like": 0,
            //             "dislike": 0,
            //             "_id": "5eb937721d4c347b1c9b0060",
            //             "title": "Ever wonder what a Steve Harvey and Meghan tha Stallion mash up would look like?",
            //             "body": "Someone created a deep fake video of Meghan tha Stallion rappin with Steve Harveys face.  And oh man its hilarious.  Theres been a bunch done of celebrities.  But putting a mans face on a woman is hilarious.  I can watch these all day.",
            //             "email": "wilsonpatrick578@gmail.com",
            //             "page": "5d763c243a332e16ae8aa61e",
            //             "anonymouscomment": "enabled",
            //             "notified": "no",
            //             "embed": "<iframe width=\"560\" height=\"315\" xxx=\"https://www.youtube.com/embed/QQdkX7JmA-8\" frameborder=\"0\" allow=\"accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen></iframe>",
            //             "embedDescription": "",
            //             "status": "active",
            //             "created": "2020-05-11T11:30:58.362Z",
            //             "files": [
            //             {
            //                 "tags": [],
            //                 "like": 0,
            //                 "dislike": 0,
            //                 "_id": "5eb937721d4c347b1c9b0061",
            //                 "signature": "Steve Harvey as Meghan the Stallion",
            //                 "secure_url": "https://www.healthyfling.com/processed/imgURL_1589196658368_de5hczmxnu1wvfc2rkxuotlzcesucg5n.jpg"
            //             }
            //             ],
            //             "__v": 0
            //         },
            //         {
            //             "sharedData": {
            //             "url": "https://www.google.com/amp/s/www.fox5dc.com/news/new-bill-proposes-student-loan-forgiveness-for-health-care-workers-on-front-lines-of-covid-19-fight.amp",
            //             "domain": "WWW.GOOGLE.COM",
            //             "title": "New bill proposes student loan forgiveness for health care workers on front lines of COVID-19 fight",
            //             "description": "Rep. Carolyn Maloney, D-N.Y., introduced a bill on Tuesday that would forgive all federal and private student loan debt for front line healthcare workers risking their lives to fight the deadly COVID-19 pandemic. ",
            //             "image": "https://images.foxtv.com/static.fox5dc.com/www.fox5dc.com/content/uploads/2020/05/724/407/GettyImages-1221917232-1.jpg?ve=1&tl=1"
            //             },
            //             "reactions": {
            //             "like": 1,
            //             "love": 0,
            //             "lol": 0,
            //             "wow": 0,
            //             "sad": 0,
            //             "angry": 0
            //             },
            //             "flagreason": [],
            //             "embedSocial": [],
            //             "videoLike": 0,
            //             "videoDislike": 0,
            //             "comments": [],
            //             "subscribers": [],
            //             "like": 0,
            //             "dislike": 0,
            //             "_id": "5eb7a01d1d4c347b1c9b0058",
            //             "title": "Essentiall workers might get their student loans forgiven",
            //             "body": "A new bill is being passed by the Democrats that will help wipe out student loan debt for essential workers.  It hasnt been passed yet, but if it does, essential workers can see a discount of up to 30k in student loan debt.\n\nTo clarify, essential workers is anyone in the front lines of this covid 19 outbreak such as hospital workers, grocery workers...etc.\n\nFingers crossed this will get passed!!!",
            //             "email": "wilsonpatrick578@gmail.com",
            //             "page": "5d763c243a332e16ae8aa61e",
            //             "anonymouscomment": "enabled",
            //             "notified": "no",
            //             "embed": "",
            //             "embedDescription": "",
            //             "status": "active",
            //             "sharedLink": true,
            //             "created": "2020-05-10T06:33:01.223Z",
            //             "files": [
            //             {
            //                 "tags": [],
            //                 "like": 0,
            //                 "dislike": 0,
            //                 "_id": "5eb7a0f71d4c347b1c9b005a",
            //                 "signature": "Group of healthcare workers",
            //                 "secure_url": "https://www.healthyfling.com/processed/imgURL_1589092597992_960x0.jpg"
            //             }
            //             ],
            //             "__v": 1
            //         },
            //         {
            //             "reactions": {
            //             "like": 1,
            //             "love": 0,
            //             "lol": 0,
            //             "wow": 0,
            //             "sad": 0,
            //             "angry": 0
            //             },
            //             "flagreason": [],
            //             "embedSocial": [],
            //             "videoLike": 0,
            //             "videoDislike": 0,
            //             "comments": [],
            //             "subscribers": [],
            //             "like": 0,
            //             "dislike": 0,
            //             "_id": "5eaffbf51d4c347b1c9b002c",
            //             "title": "Justin Bieber full frontal nudes",
            //             "body": "For those who havent seen it yet or just curious, here are Justin Biebers nudes.  Hes not too bad for someone his size, thoughts?\n\nNot sure where this was taken or who took it.  But its out.",
            //             "email": "wilsonpatrick578@gmail.com",
            //             "page": "5d763c243a332e16ae8aa61e",
            //             "anonymouscomment": "enabled",
            //             "notified": "no",
            //             "embed": "",
            //             "embedDescription": "",
            //             "status": "active",
            //             "created": "2020-05-04T11:26:45.934Z",
            //             "files": [
            //             {
            //                 "tags": [],
            //                 "like": 0,
            //                 "dislike": 0,
            //                 "secure_url": "https://www.healthyfling.com/processed/imgUploader_1588591551149_cpjoi35usaex4np.jpg",
            //                 "signature": "",
            //                 "_id": "5eaffc091d4c347b1c9b0034"
            //             },
            //             {
            //                 "tags": [],
            //                 "like": 0,
            //                 "dislike": 0,
            //                 "secure_url": "https://www.healthyfling.com/processed/imgUploader_1588591561366_cpjoi2puaaaj8dv.jpg",
            //                 "signature": "",
            //                 "_id": "5eaffc091d4c347b1c9b0033"
            //             },
            //             {
            //                 "tags": [],
            //                 "like": 0,
            //                 "dislike": 0,
            //                 "secure_url": "https://www.healthyfling.com/processed/imgUploader_1588591566094_cpv8jevuaaaw7cu.jpg",
            //                 "signature": "",
            //                 "_id": "5eaffc091d4c347b1c9b0032"
            //             },
            //             {
            //                 "tags": [],
            //                 "like": 0,
            //                 "dislike": 0,
            //                 "secure_url": "https://www.healthyfling.com/processed/imgUploader_1588591570721_cpv8je0ueayd2bp.jpg",
            //                 "signature": "",
            //                 "_id": "5eaffc091d4c347b1c9b0031"
            //             }
            //             ],
            //             "__v": 1
            //         },
            //         {
            //             "reactions": {
            //             "like": 0,
            //             "love": 0,
            //             "lol": 0,
            //             "wow": 0,
            //             "sad": 0,
            //             "angry": 0
            //             },
            //             "flagreason": [],
            //             "embedSocial": [],
            //             "videoLike": 0,
            //             "videoDislike": 0,
            //             "comments": [],
            //             "subscribers": [],
            //             "like": 0,
            //             "dislike": 0,
            //             "_id": "5eaff0871d4c347b1c9b002b",
            //             "title": "Interesting video from 1959 that shows the future bed",
            //             "body": "Pretty amazing how accurate 1959 was per the video.  Automatic curtains, lighting, adjustable beds and so on.  I bet it would of cost an arm and a leg then.  Looks awesome though seeing what my great grandparents were living like.",
            //             "email": "wilsonpatrick578@gmail.com",
            //             "page": "5d763c243a332e16ae8aa61e",
            //             "anonymouscomment": "enabled",
            //             "notified": "no",
            //             "embed": "<iframe width=\"560\" height=\"315\" xxx=\"https://www.youtube.com/embed/e97xYgjByf8\" frameborder=\"0\" allow=\"accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen></iframe>",
            //             "embedDescription": "bed of the future 1959",
            //             "status": "active",
            //             "created": "2020-05-04T10:37:59.167Z",
            //             "files": [],
            //             "__v": 0
            //         },
            //         {
            //             "sharedData": {
            //             "url": "https://www.newsweek.com/north-korean-leader-kim-jong-un-appears-public-ending-weeks-speculation-about-his-health-1501557",
            //             "domain": "WWW.NEWSWEEK.COM",
            //             "title": "North Korean Leader Kim Jong Un appears in public, ending weeks of speculation about his health",
            //             "description": "Previous to now, the head of state hadn't been publicly seen for two weeks, raising concerns about his health and rumors about his disappearance amid the coronavirus epidemic.",
            //             "image": "https://d.newsweek.com/en/full/1586726/north-korean-leader-kim-jong-un.jpg"
            //             },
            //             "reactions": {
            //             "like": 0,
            //             "love": 0,
            //             "lol": 0,
            //             "wow": 0,
            //             "sad": 0,
            //             "angry": 0
            //             },
            //             "flagreason": [],
            //             "embedSocial": [],
            //             "videoLike": 0,
            //             "videoDislike": 0,
            //             "comments": [],
            //             "subscribers": [],
            //             "like": 0,
            //             "dislike": 0,
            //             "_id": "5eaca64e1d4c347b1c9b0024",
            //             "title": "Kim Jong Un is alive",
            //             "body": "Damn thought he was dead.  Apparently hes still alive.   Or mabye its his doppelganger?🤔🤔🤔",
            //             "email": "wilsonpatrick578@gmail.com",
            //             "page": "5d763c243a332e16ae8aa61e",
            //             "anonymouscomment": "enabled",
            //             "notified": "no",
            //             "embed": "",
            //             "embedDescription": "",
            //             "status": "active",
            //             "sharedLink": true,
            //             "created": "2020-05-01T22:44:30.448Z",
            //             "files": [],
            //             "__v": 0
            //         },
            //         {
            //             "reactions": {
            //             "like": 0,
            //             "love": 1,
            //             "lol": 1,
            //             "wow": 0,
            //             "sad": 0,
            //             "angry": 0
            //             },
            //             "flagreason": [],
            //             "embedSocial": [],
            //             "videoLike": 0,
            //             "videoDislike": 0,
            //             "comments": [
            //             "5eaca4ea1d4c347b1c9b0023",
            //             "5eacdf4b1d4c347b1c9b0026"
            //             ],
            //             "subscribers": [],
            //             "like": 0,
            //             "dislike": 0,
            //             "_id": "5eac00ed1d4c347b1c9b0020",
            //             "title": "Someone made a hilarious 50 cent and Taylor Swift mash up mural",
            //             "body": "Some talented graffiti artist just made a 50 Cent and Taylor Swift Mural mashed into one.  The artist didn't hold back and made sure to add earnings and everything.  Its really hilarious how good 50 Cent looks as Taylor.",
            //             "email": "wilsonpatrick578@gmail.com",
            //             "page": "5d763c243a332e16ae8aa61e",
            //             "anonymouscomment": "enabled",
            //             "notified": "no",
            //             "embed": "",
            //             "embedDescription": "",
            //             "status": "active",
            //             "created": "2020-05-01T10:58:53.845Z",
            //             "files": [
            //             {
            //                 "tags": [],
            //                 "like": 0,
            //                 "dislike": 0,
            //                 "_id": "5eac00ee1d4c347b1c9b0021",
            //                 "signature": "50 Cent and Taylor",
            //                 "secure_url": "https://www.healthyfling.com/processed/imgURL_1588330733865_50-cent-turned-into-taylor-swift-video-clip-759x500.png"
            //             }
            //             ],
            //             "__v": 0
            //         },
            //         {
            //             "reactions": {
            //             "like": 0,
            //             "love": 0,
            //             "lol": 0,
            //             "wow": 0,
            //             "sad": 0,
            //             "angry": 0
            //             },
            //             "flagreason": [],
            //             "embedSocial": [],
            //             "videoLike": 0,
            //             "videoDislike": 0,
            //             "comments": [],
            //             "subscribers": [],
            //             "like": 0,
            //             "dislike": 0,
            //             "_id": "5e9d75ee1d4c347b1c9b0000",
            //             "title": "Apparently weed does a body good as per Wiz Khalifas body transformation",
            //             "body": "Wiz Khalifa is mostly seen as thin skinny and full of tatts.  Never in a million years would I imagine someone like him, a weed smoker, to be jacked ripped.  Well another week and another Hollywood transformation and the pics speak for themselves.  Take a look.",
            //             "email": "wilsonpatrick578@gmail.com",
            //             "page": "5d763c243a332e16ae8aa61e",
            //             "anonymouscomment": "enabled",
            //             "notified": "no",
            //             "embed": "",
            //             "embedDescription": "",
            //             "status": "active",
            //             "created": "2020-04-20T10:14:06.487Z",
            //             "files": [
            //             {
            //                 "tags": [],
            //                 "like": 0,
            //                 "dislike": 0,
            //                 "_id": "5e9d75ef1d4c347b1c9b0001",
            //                 "signature": "Wiz skinny as usual",
            //                 "secure_url": "https://www.healthyfling.com/processed/imgURL_1587377646509_wiz-khalifa.jpg"
            //             },
            //             {
            //                 "tags": [],
            //                 "like": 0,
            //                 "dislike": 0,
            //                 "_id": "5e9d75ef1d4c347b1c9b0002",
            //                 "signature": "Wiz working out",
            //                 "secure_url": "https://www.healthyfling.com/processed/imgURL_1587377646508_b29d06052d9e6d50cb8c03a03653e23d.jpg"
            //             },
            //             {
            //                 "tags": [],
            //                 "like": 0,
            //                 "dislike": 0,
            //                 "_id": "5e9d75ef1d4c347b1c9b0003",
            //                 "signature": "No caption needed just look that physique",
            //                 "secure_url": "https://www.healthyfling.com/processed/imgURL_1587377646510_9d60aee51545f137da3ae1e6dd8a8c15.jpg"
            //             }
            //             ],
            //             "__v": 0
            //         },
            //         {
            //             "sharedData": {
            //             "url": "https://www.jpost.com/diaspora/amy-schumer-changes-sons-name-so-it-does-not-sound-like-genital-625049",
            //             "domain": "WWW.JPOST.COM",
            //             "title": "Amy Schumer changes son’s name so it does not sound like ‘genital’",
            //             "description": "\"It was Gene Attell Fischer, but we realized that we, by accident, named our son ‘genital.’ Gene Attell sounds like genital,” she said.",
            //             "image": "https://images.jpost.com/image/upload/f_auto,fl_lossy/t_JD_ArticleMainImageFaceDetect/437721"
            //             },
            //             "reactions": {
            //             "like": 0,
            //             "love": 0,
            //             "lol": 0,
            //             "wow": 0,
            //             "sad": 0,
            //             "angry": 0
            //             },
            //             "flagreason": [],
            //             "embedSocial": [],
            //             "videoLike": 0,
            //             "videoDislike": 0,
            //             "comments": [],
            //             "subscribers": [],
            //             "like": 0,
            //             "dislike": 0,
            //             "_id": "5e9c37561d4c347b1c9afff6",
            //             "title": "Amy Schumer changes sons name because it sounds like genitals",
            //             "body": "Amy Schumer recently changed her 11 months old sons name because it sounded like the word \"Genital\".  Her sons original name was Gene Attell Fischer.  Saying the whole name out loud does actually sound like it too.\n\nNow her sons name is Gene Davis Fischer.  A little better but not sure why it took her 11 months to figure out their kids name sounds like Genitals..hahaha",
            //             "email": "wilsonpatrick578@gmail.com",
            //             "page": "5d763c243a332e16ae8aa61e",
            //             "anonymouscomment": "enabled",
            //             "notified": "no",
            //             "embed": "",
            //             "embedDescription": "",
            //             "status": "active",
            //             "sharedLink": true,
            //             "created": "2020-04-19T11:34:46.640Z",
            //             "files": [
            //             {
            //                 "tags": [],
            //                 "like": 0,
            //                 "dislike": 0,
            //                 "secure_url": "https://www.healthyfling.com/processed/imgURL_1587296086651_pictures-amy-schumer-baby-son-gene.jpg",
            //                 "signature": "Amy and her son Gene",
            //                 "_id": "5e9c381d1d4c347b1c9afffe"
            //             },
            //             {
            //                 "tags": [],
            //                 "like": 0,
            //                 "dislike": 0,
            //                 "secure_url": "https://www.healthyfling.com/processed/imgURL_1587296218225_rs_1024x759-200123091034-1024-amy-schumer-chris-fischer-kylie-dunnigan-lt-12320-gettyimages-1086486850-gettyimages-632233218.jpg",
            //                 "signature": "Amy and her husband",
            //                 "_id": "5e9c381d1d4c347b1c9afffd"
            //             }
            //             ],
            //             "__v": 3
            //         },
            //         {
            //             "sharedData": {
            //             "url": "https://www.buzzfeednews.com/article/salvadorhernandez/grindr-killing-kevin-bacon-michigan",
            //             "domain": "WWW.BUZZFEEDNEWS.COM",
            //             "title": "A Man Is Accused Of Killing His Grindr Date And Then Eating Part Of His Body",
            //             "description": "Court documents revealed gruesome details in the killing of 25-year-old Kevin Bacon, who went missing on Christmas Eve.",
            //             "image": "https://img.buzzfeed.com/buzzfeed-static/static/2020-01/6/23/enhanced/9c8f1188587b/original-2408-1578354523-9.png?crop=671:351;0,205"
            //             },
            //             "reactions": {
            //             "like": 0,
            //             "love": 0,
            //             "lol": 0,
            //             "wow": 1,
            //             "sad": 0,
            //             "angry": 0
            //             },
            //             "flagreason": [],
            //             "embedSocial": [],
            //             "videoLike": 0,
            //             "videoDislike": 0,
            //             "comments": [],
            //             "subscribers": [],
            //             "like": 1,
            //             "dislike": 0,
            //             "_id": "5e15c6de4219be72e84191e6",
            //             "title": "A Man Is Accused Of Killing His Grindr Date And Then Eating Part Of His Body",
            //             "body": "A Flint Michigan man was charged with murdering his Grindr date and hanging his body in his house and even eating his testicles.  The man he killed told his roommate he was meeting a man 25 miles away.  He even texted his roommate saying he probably wont come home that night.  Then he ended up missing till cops searched the mans home and found his body hanging.  \n\nMoral of the story, dont meet just anybody through apps.  If they look weird like the guy in the pic, pass on!!!",
            //             "email": "wilsonpatrick578@gmail.com",
            //             "page": "5d763c243a332e16ae8aa61e",
            //             "anonymouscomment": "enabled",
            //             "notified": "no",
            //             "embed": "",
            //             "passcode": "71040808",
            //             "status": "active",
            //             "sharedLink": true,
            //             "created": "2020-01-08T12:11:10.181Z",
            //             "files": [
            //             {
            //                 "tags": [],
            //                 "like": 0,
            //                 "dislike": 0,
            //                 "_id": "5e15c6de4219be72e84191e7",
            //                 "secure_url": "https://www.healthyfling.com/processed/imgURL_1578485470218_sub-buzz-2394-1578351656-15.png"
            //             }
            //             ],
            //             "__v": 0
            //         },
            //         {
            //             "sharedData": {
            //             "url": "https://www.eonline.com/shows/peoples_choice_awards/news/1101768/kevin-mccallister-from-home-alone-is-a-psychopath-and-we-have-the-proof",
            //             "domain": "WWW.EONLINE.COM",
            //             "title": "We Can Prove Kevin McCallister from Home Alone is a Psychopath",
            //             "description": "Kevin McCallister's booby traps suddenly seem a lot darker in Home Alone and Home Alone 2.",
            //             "image": "https://akns-images.eonline.com/eol_images/Entire_Site/2018116/rs_600x600-181206112142-600-home-alone-kevin-hanging-out.jpg?fit=around|600:467&crop=600:467;center,top&output-quality=90"
            //             },
            //             "reactions": {
            //             "like": 0,
            //             "love": 0,
            //             "lol": 0,
            //             "wow": 1,
            //             "sad": 1,
            //             "angry": 0
            //             },
            //             "flagreason": [],
            //             "embedSocial": [],
            //             "videoLike": 0,
            //             "videoDislike": 0,
            //             "comments": [
            //             "5e05f6f15aabf952252e6816"
            //             ],
            //             "subscribers": [],
            //             "like": 0,
            //             "dislike": 0,
            //             "_id": "5e00d85dae4e6d027a77af0e",
            //             "title": "The real story behind the movie home alone😯😯😟😟😟",
            //             "body": "This is so true",
            //             "email": "wilsonpatrick578@gmail.com",
            //             "page": "5d763c243a332e16ae8aa61e",
            //             "anonymouscomment": "enabled",
            //             "notified": "no",
            //             "embed": "",
            //             "passcode": "14134142",
            //             "status": "active",
            //             "sharedLink": true,
            //             "created": "2019-12-23T15:08:13.590Z",
            //             "files": [],
            //             "__v": 0
            //         },
            //         {
            //             "reactions": {
            //             "like": 0,
            //             "love": 0,
            //             "lol": 0,
            //             "wow": 1,
            //             "sad": 0,
            //             "angry": 0
            //             },
            //             "flagreason": [],
            //             "embedSocial": [],
            //             "videoLike": 0,
            //             "videoDislike": 0,
            //             "comments": [],
            //             "subscribers": [],
            //             "like": 0,
            //             "dislike": 0,
            //             "_id": "5dde82d3e01bbe27bc2d9a39",
            //             "title": "Girl chokes out guy and makes him his bitch (hahahaha)",
            //             "body": "Found this on the web.  It shows a guy and a girl playfully wrestling till the chick gets super serious and pins the dude and makes him tap out.  Looking at the girls face she wasnt playing.  Sucks it was caught on camera, gonna haunt the kid for the rest of his life...haha",
            //             "email": "wilsonpatrick578@gmail.com",
            //             "page": "5d763c243a332e16ae8aa61e",
            //             "anonymouscomment": "enabled",
            //             "notified": "no",
            //             "embed": "<iframe width=\"640\" height=\"360\" xxx=\"https://www.worldstarhiphop.com/embed/144411\" frameborder=\"0\" allowfullscreen></iframe>",
            //             "passcode": "88654754",
            //             "status": "active",
            //             "created": "2019-11-27T14:06:11.256Z",
            //             "files": [],
            //             "__v": 0
            //         },
            //         {
            //             "reactions": {
            //             "like": 0,
            //             "love": 1,
            //             "lol": 2,
            //             "wow": 0,
            //             "sad": 0,
            //             "angry": 0
            //             },
            //             "flagreason": [],
            //             "embedSocial": [],
            //             "videoLike": 0,
            //             "videoDislike": 0,
            //             "comments": [],
            //             "subscribers": [],
            //             "like": 2,
            //             "dislike": 0,
            //             "_id": "5dcbea70d1ddd36616c87fc0",
            //             "title": "If this isn't the weirdest and explicit gender reveal ever",
            //             "body": "I will say its very thoughtful to fart blue or pink dust.  But its a little disgusting and weird.  I dont see this becoming a trend especially in front of family, friends and children...smh. ....but it is funny to watch hahaha",
            //             "email": "wilsonpatrick578@gmail.com",
            //             "page": "5d763c243a332e16ae8aa61e",
            //             "anonymouscomment": "enabled",
            //             "notified": "no",
            //             "embed": "https://www.youtube.com/watch?v=f4Jso3x4BrI",
            //             "passcode": "05630121",
            //             "status": "active",
            //             "created": "2019-11-13T11:35:12.566Z",
            //             "files": [
            //             {
            //                 "tags": [],
            //                 "like": 1,
            //                 "dislike": 0,
            //                 "_id": "5dcbea70d1ddd36616c87fc1",
            //                 "signature": "taki taki raki",
            //                 "secure_url": "https://www.healthyfling.com/processed/imgURL_1573644912592_comedian-gender-reveal-fart-1200x836.jpg"
            //             }
            //             ],
            //             "__v": 0
            //         },
            //         {
            //             "reactions": {
            //             "like": 0,
            //             "love": 0,
            //             "lol": 2,
            //             "wow": 0,
            //             "sad": 0,
            //             "angry": 0
            //             },
            //             "flagreason": [],
            //             "embedSocial": [],
            //             "videoLike": 0,
            //             "videoDislike": 0,
            //             "comments": [
            //             "5dbd732e082289020628bc3c"
            //             ],
            //             "subscribers": [],
            //             "like": 1,
            //             "dislike": 0,
            //             "_id": "5dbc1cd1082289020628bc30",
            //             "title": "By far the best Halloween decoration!!!",
            //             "body": "Someone was not only comprehensive with their Halloween decoration but also stingy....haha",
            //             "email": "wilsonpatrick578@gmail.com",
            //             "page": "5d763c243a332e16ae8aa61e",
            //             "anonymouscomment": "enabled",
            //             "notified": "yes",
            //             "embed": "",
            //             "passcode": "86946201",
            //             "status": "active",
            //             "created": "2019-11-01T11:53:53.562Z",
            //             "files": [
            //             {
            //                 "tags": [],
            //                 "like": 0,
            //                 "dislike": 0,
            //                 "secure_url": "https://www.healthyfling.com/processed/imgUploader_1572609221781_5da8354693bc0_53muwr31eiz11__700.jpg",
            //                 "_id": "5dbc1cd1082289020628bc31"
            //             }
            //             ],
            //             "__v": 0
            //         },
            //         {
            //             "reactions": {
            //             "like": 0,
            //             "love": 0,
            //             "lol": 1,
            //             "wow": 0,
            //             "sad": 0,
            //             "angry": 0
            //             },
            //             "flagreason": [],
            //             "embedSocial": [],
            //             "videoLike": 0,
            //             "videoDislike": 0,
            //             "comments": [
            //             "5db34e3a082289020628bbd6",
            //             "5db6e0f5082289020628bc09"
            //             ],
            //             "subscribers": [],
            //             "like": 1,
            //             "dislike": 0,
            //             "_id": "5db2f747082289020628bbd3",
            //             "title": "Lol: Weather Girl Accidentally Says \"Big D*ck\" On National TV!",
            //             "body": "Weather Girl Accidentally Says \"Big D*ck\" On TV but handles it like  a pro.  Give her an Emmy please!",
            //             "email": "wilsonpatrick578@gmail.com",
            //             "page": "5d763c243a332e16ae8aa61e",
            //             "anonymouscomment": "enabled",
            //             "notified": "yes",
            //             "embed": "<iframe width=\"640\" height=\"360\" xxx=\"https://www.worldstarhiphop.com/embed/143083\" frameborder=\"0\" allowfullscreen></iframe>",
            //             "passcode": "08605114",
            //             "status": "active",
            //             "created": "2019-10-25T13:23:19.510Z",
            //             "files": [
            //             {
            //                 "tags": [],
            //                 "like": 0,
            //                 "dislike": 0,
            //                 "secure_url": "https://www.healthyfling.com/processed/imgUploader_1572009774546_x.png",
            //                 "_id": "5db2f747082289020628bbd4"
            //             }
            //             ],
            //             "__v": 0
            //         },
            //         {
            //             "reactions": {
            //             "like": 0,
            //             "love": 0,
            //             "lol": 0,
            //             "wow": 0,
            //             "sad": 0,
            //             "angry": 0
            //             },
            //             "flagreason": [
            //             ""
            //             ],
            //             "embedSocial": [],
            //             "videoLike": 0,
            //             "videoDislike": 0,
            //             "comments": [
            //             "5db2f67f082289020628bbd2"
            //             ],
            //             "subscribers": [],
            //             "like": 0,
            //             "dislike": 0,
            //             "_id": "5db033ebbaf981622d44195b",
            //             "title": "Dont you hate when you take your car in for an alignment and...........",
            //             "body": ".........the steering wheel is more crooked than before :-(\n\n#Firestonemessedup",
            //             "email": "wilsonpatrick578@gmail.com",
            //             "page": "5d763c243a332e16ae8aa61e",
            //             "anonymouscomment": "enabled",
            //             "notified": "no",
            //             "embed": "",
            //             "passcode": "26336000",
            //             "status": "active",
            //             "created": "2019-10-23T11:05:15.236Z",
            //             "files": [
            //             {
            //                 "tags": [],
            //                 "like": 0,
            //                 "dislike": 0,
            //                 "_id": "5db033ebbaf981622d44195c",
            //                 "secure_url": "https://www.healthyfling.com/processed/imgURL_1571828715253_1f9044e2-29c0-4490-93d5-1c62b872be2a-png.68499"
            //             }
            //             ],
            //             "__v": 0
            //         },
            //         {
            //             "reactions": {
            //             "like": 0,
            //             "love": 0,
            //             "lol": 0,
            //             "wow": 0,
            //             "sad": 0,
            //             "angry": 0
            //             },
            //             "flagreason": [],
            //             "embedSocial": [],
            //             "videoLike": 0,
            //             "videoDislike": 0,
            //             "comments": [],
            //             "subscribers": [],
            //             "like": 0,
            //             "dislike": 0,
            //             "_id": "5d8de8763eaa5534cec49aad",
            //             "title": "This guy is definently is a contractor genius",
            //             "body": "Dont know where hes from but this guy made a pool with the small items he has.  Looks like a small remote country somewhere.  \n\nThis guy would definently save me money....:-)",
            //             "email": "passp994@gmail.com",
            //             "page": "5d763c243a332e16ae8aa61e",
            //             "anonymouscomment": "enabled",
            //             "notified": "yes",
            //             "embed": "https://www.youtube.com/watch?time_continue=1497&v=70_cwsUHuIU",
            //             "passcode": "01758121",
            //             "status": "active",
            //             "created": "2019-09-27T10:46:14.319Z",
            //             "files": [],
            //             "__v": 0
            //         },
            //         {
            //             "reactions": {
            //             "like": 0,
            //             "love": 0,
            //             "lol": 0,
            //             "wow": 0,
            //             "sad": 0,
            //             "angry": 0
            //             },
            //             "flagreason": [],
            //             "embedSocial": [],
            //             "videoLike": 0,
            //             "videoDislike": 0,
            //             "comments": [],
            //             "subscribers": [],
            //             "like": 1,
            //             "dislike": 0,
            //             "_id": "5d763c243a332e16ae8aa61f",
            //             "title": "OMG the amazon is completely wiped out",
            //             "body": "I've always been terrified of the amazon especially all the poisonous critters and bugs.  Now its a flat land with all of those animals and reptiles probably dead.  Its crazy.",
            //             "email": "wilsonpatrick578@gmail.com",
            //             "page": "5d763c243a332e16ae8aa61e",
            //             "anonymouscomment": "enabled",
            //             "embed": "",
            //             "passcode": "88010229",
            //             "status": "active",
            //             "created": "2019-09-09T11:48:52.651Z",
            //             "files": [
            //             {
            //                 "tags": [],
            //                 "like": 0,
            //                 "dislike": 1,
            //                 "secure_url": "https://www.healthyfling.com/processed/imgUploader_1568029676206_$_(1).jpg",
            //                 "_id": "5d763c243a332e16ae8aa621"
            //             },
            //             {
            //                 "tags": [],
            //                 "like": 0,
            //                 "dislike": 1,
            //                 "secure_url": "https://www.healthyfling.com/processed/imgUploader_1568029681516_$.jpg",
            //                 "_id": "5d763c243a332e16ae8aa620"
            //             }
            //             ],
            //             "__v": 1,
            //             "notified": "yes"
            //         }
            //         ]
            //     }
            // };

            if (response.status == '200' && response.data && response.data.page) {

              $rootScope.metaservice = MetaService;
              $rootScope.metaservice.set(response.data.page.title, response.data.page.description, (response.data.page.profilePic ? response.data.page.profilePic : false));

              var params = $location.search();
              if(params && params.success == 'true'){
                  FlashService.Success("Your page is now Live.");
              }

              $scope.pageData = response.data.page;
              $scope.title = response.data.page.title;
              $scope.postData = response.data.posts;
              $scope.gallery = [];
              // slice(0).reverse().
              $scope.postData.map(function(item) {
                  if (item) {
                      item.files.map(function(galleryItem) {
                          if (galleryItem) {
                              $scope.gallery.push({
                                  image: galleryItem.secure_url,
                                  _id: galleryItem._id,
                                  postId: item._id
                              });
                          }
                      });
                      if (item.embed) {
                          $scope.gallery.push({
                              video: true,
                              postId: item._id
                          });
                      }
                  }
              });

                $rootScope.visitedSearchPage = true;

                $rootScope.adPosts.data = [];

                for(var i = 0;i<response.data.length;i++){
                    $rootScope.adPosts.data.push(response.data[i]);
                }

                $rootScope.refreshAds();
                $rootScope.loading = false;
            }else{
                // FlashService.Error(response.data.resultDescription);
                vm.dataLoading = false;
                $location.path('/');
                $rootScope.loading = false;
            };

        });

    }

    $scope.subscribe = function (){
      $rootScope.subscribePageId = $routeParams.id;
      $rootScope.modalInstance = $modal.open({
         templateUrl: 'app-view/subscribe/SubscribePageView.html'
     });
    }

    $scope.reportPage = function (){
      $rootScope.subscribePageId = $routeParams.id;
      $rootScope.modalInstance = $modal.open({
         templateUrl: 'app-view/report/ReportView.html'
     });
    }

}]);

app.filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        if (input) {
            return input.slice(start);
        }else{
            return 0;
        }

    }
});

app.filter('roundup', function() {
  return function(input) {
    return Math.ceil(input);
  };
});


app.controller("AdsController",['$scope','$rootScope','$location','HttpService','$window', function ($scope,$rootScope,$location,HttpService,$window) {

  var vm = {};

  $rootScope.savedPreference = $window.localStorage.getItem("healthyfling_preference");

    if ($rootScope.savedPreference == "locked") {
        $rootScope.search.country = $window.localStorage.getItem("healthyfling_preference_country") || "Country";
        $rootScope.search.state = $window.localStorage.getItem("healthyfling_preference_state") || "State";
        $rootScope.search.region = $window.localStorage.getItem("healthyfling_preference_region") || "Region";
        $rootScope.search.category = $window.localStorage.getItem("healthyfling_preference_category") || "Category";
    }

    $scope.savedPreference = ($rootScope.savedPreference == "locked");
    vm.savedPreference = ($rootScope.savedPreference == "locked");

  vm.country = $rootScope.search.country;
  vm.state = $rootScope.search.state;
  vm.region = $rootScope.search.region;
  vm.category = $rootScope.search.category;

  $rootScope.loading = true;

  $rootScope.currentPost = {};

   $rootScope.viewDetail = function(data){

        $rootScope.currentPost.data = data;
        $location.path("/detail/"+data['_id']);
   }

  $rootScope.refreshAds = function(){

    HttpService.GetPagePosts()
    .then(function(response){

        if (response.status == '200') {
            $rootScope.adPosts.data = [];

            if($rootScope.search.region != "Region" && $rootScope.search.region != ""){
                $rootScope.pageTitle = $rootScope.search.region;
            }else{
                $rootScope.pageTitle = "All Regions";
            }

            for(var i = 0;i<response.data.length;i++){
                $rootScope.adPosts.data.push(response.data[i]);
            }

            $rootScope.loading = false;
        }else{
            $rootScope.loading = false;
            vm.dataLoading = false;
            $location.path('/');
        };

    });

    // if($rootScope.adPosts.data){
        $scope.data = $rootScope.adPosts.data.reverse();
    // }

  }

}]);
