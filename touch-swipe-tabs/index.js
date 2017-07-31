/**
 * Created by xiaoma on 2017/7/27.
 */
var SwipeTab = (function (doc) {
    var tabList = doc.querySelector('.tabs_list'),
        tabs = doc.querySelectorAll('.tabs_item'),
        tabLine = doc.querySelector('.tabs_line'),
        touchArea = doc.querySelector('.content'),
        contentList = doc.querySelector('.content_list'),
        contentItem = doc.querySelectorAll('.content_item'),
        tabsWidth = tabList.offsetWidth,//所有tab的宽度，用于设置tabs_container的宽度
        tabWidth = tabs[0].offsetWidth,//第一tab的宽度，用于初始化线宽
        lineTranslateX = 0,//选中tab，线移动的距离
        viewWidth = window.innerWidth || doc.body.clientWidth || doc.documentElement.clientWidth,//屏幕可视区域宽度,用于设置每个tab内容区域的宽度
        totalWidth = (tabs.length - 1) * viewWidth,//所有tab内容的总宽度，用于比较是否切换到了最后一个tab
        DIS = 50,//用于判断是否切换到下一个tab，如果大于该值，则切换到下一个tab
        translate = 0, //显示选中tab内容，需要移动的距离
        currIndex = 0,//当前选中tab的索引
        touching = false,//用于判断是否还在touch
        isMoved = false,// 用于判断左右滑动还是上下滑动
        startX, startY,//touchstart手指所在位置
        diffX, diffY;//移动的距离

    /**
     * 选中tab,字体变红
     * @param index：选中tab的索引
     */
    function changeSelectedTab(index) {
        Array.prototype.forEach.call(tabs, function (item, key) {
            if (key === index) {
                item.classList.add('tabs_item_active');
            } else {
                item.classList.remove('tabs_item_active');
            }
        });
    }

    /**
     * 选中tab后，样式的变化，包括：字体变红、重新设置线宽、线移动到选中tab下方、调整滚动区域的位置，合理显示选中tab
     * @param index：选中tab的索引
     * @param target：选中tab元素
     */
    function selectedTab(index, target) {
        //tab字体变红
        changeSelectedTab(index);
        //重新设置线宽
        tabWidth = target.offsetWidth;
        //线移动到点击内容下方
        lineTranslateX = target.offsetLeft;
        tabLine.style.cssText = 'width:' + tabWidth + 'px;-webkit-transform:translateX(' + lineTranslateX + 'px);transform:translateX(' + lineTranslateX + 'px);';
        //调整选中tab的位置
        if (lineTranslateX > viewWidth / 2) {
            doc.querySelector('.tabs_scroll').scrollLeft = lineTranslateX / 2;
        } else {
            doc.querySelector('.tabs_scroll').scrollLeft = 0;
        }
    }

    /**
     * 计算cos两条边夹角的角度
     * @param y：三角形一条直角边
     * @param z：三角形跟这条边相邻的斜边
     * @returns {number}：夹角角度
     */
    function getCosAngel(y, z) {
        var cos = y / z;
        return Math.acos(cos) / Math.PI * 180;
    }

    function init() {
        doc.querySelector('.tabs_container').style.width = tabsWidth + 'px';
        tabLine.style.width = tabWidth + 'px';
        Array.prototype.forEach.call(contentItem, function (item) {
            item.style.width = viewWidth + 'px';
        });
        bindEvent();
    }

    function bindEvent() {
        //点击tab切换tab和对应内容
        tabList.addEventListener('click', function (e) {
            e.preventDefault();
            var target = e.target;
            if (target.classList.contains('tabs_item') && !target.classList.contains('tabs_item_active')) {
                var index = parseInt(target.dataset['index']);
                //选中tab
                selectedTab(index, target);
                //显示选中tab内容
                translate = index * viewWidth;
                contentList.style.cssText = 'height:' + contentItem[index].offsetHeight + 'px;-webkit-transform:translateX(-' + translate + 'px);transform:translateX(-' + translate + 'px);';
                //存储选中tab的index
                currIndex = index;
            }
        }, false);
        //左右滑动
        touchArea.addEventListener('touchstart', function (e) {
            if (touching) return;
            var touch = e.targetTouches[0];
            startX = touch.pageX;
            startY = touch.pageY;
            touching = true;
            //touchmove时，移动的距离不加过渡效果，不然页面会抖动。
            contentList.classList.remove('content_list_transition');
        }, false);
        touchArea.addEventListener('touchmove', function (e) {
            if (!touching) return;
            var touch = e.targetTouches[0],
                pageX = touch.pageX,
                pageY = touch.pageY;
            diffX = pageX - startX;
            diffY = pageY - startY;
            if (isMoved) {
                e.preventDefault();//如果对阻止默认行为不做判断，页面滚动将被禁止。
                var widthdivThree = viewWidth / 3;
                //第一个tab向右滑动，最多滑动页面宽度的三分之一
                if (translate === 0 && diffX > widthdivThree) {
                    diffX = widthdivThree;
                    return;
                }
                //最后一个tab向左滑动，最多滑动页面宽度的三分之一
                if (translate === totalWidth && diffX < -widthdivThree) {
                    diffX = -widthdivThree;
                    return;
                }
                //每次移动，页面内容也跟着移动对应距离
                if (diffX !== 0) {
                    var translateX = diffX - translate;
                    contentList.style.cssText = '-webkit-transform:translateX(' + translateX + 'px);transform:translateX(' + translateX + 'px);';
                }
            } else {
                var diffZ = Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2)),
                    angle = getCosAngel(Math.abs(diffY), diffZ);
                //如果符合该条件，页面将可以左右滑动；如果不符合该条件，页面将会上下滚动。阻止了上下滑动时触发左右滑动的执行的内容
                if (diffZ > 5 && angle > 80) {
                    e.preventDefault();
                    isMoved = true;
                }
            }
        }, false);
        touchArea.addEventListener('touchend', function () {
            if (touching && isMoved) {
                contentList.classList.add('content_list_transition');
                //第一个向右滑动或者最后一个向左滑动时，不切换tab
                if ((translate === 0 && diffX > 0) || (translate === totalWidth && diffX < 0)) {
                    translate = translate;
                }
                //如果滑动距离大于屏DIS，切换到下一个tab;否则返回到滑动之前的tab
                else if (Math.abs(diffX) > DIS) {
                    translate = diffX > 0 ? (translate - viewWidth) : (translate + viewWidth);
                    currIndex = diffX > 0 ? (currIndex - 1) : (currIndex + 1);
                    selectedTab(currIndex, tabs[currIndex]);
                }
                contentList.style.cssText = 'height:' + contentItem[currIndex].offsetHeight + 'px;webkit-transform:translateX(-' + translate + 'px);transform:translateX(-' + translate + 'px);';
            }
            touching = false;
            isMoved = false;
        }, false);

    }

    return {
        init: init
    }
})(document);