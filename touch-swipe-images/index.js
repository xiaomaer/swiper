/**
 * Created by xiaoma on 2017/7/31.
 */
var SwipeImage = (function (win, doc) {
    var viewHeight = win.innerHeight || doc.body.clientHeight || doc.documentElement.clientHeight,
        container = doc.querySelector('.container'),
        imagesContainer = doc.querySelector('.images_container'),
        images = doc.querySelectorAll('.image_container'),
        imagesLen = images.length,
        totalTranslate = viewHeight * (imagesLen - 1),
        DIS = 50,//滑动距离大于100时，切换到下一张图片
        ANGEL = 30,//cos夹角小于30时，判断为上下滑动
        currIndex = 0,
        translate = 0,
        isTouching = false,
        isMoved = false,
        startX, startY,
        diffX, diffY;

    function init() {
        //图片容器高度是整个屏幕可视区域的高度
        Array.prototype.forEach.call(images, function (item) {
            item.style.height = viewHeight + 'px';
        });
        bindEvent();
    }

    function bindEvent() {
        container.addEventListener('touchstart', function (e) {
            if (isTouching) return;
            var target = e.targetTouches[0];
            startX = target.pageX;
            startY = target.pageY;
            isTouching = true;
            imagesContainer.classList.remove('images_container');
            images[currIndex].classList.remove('image_container_transition');
        }, false);
        container.addEventListener('touchmove', function (e) {
            if (!isTouching) return;
            var target = e.targetTouches[0],
                moveX = target.pageX,
                moveY = target.pageY;
            diffX = moveX - startX;
            diffY = moveY - startY;
            if (isMoved) {
                e.preventDefault();
                var viewHeightd3 = viewHeight / 3;
                if (translate === 0 && diffY > viewHeightd3) {
                    diffY = viewHeightd3;
                    return;
                }
                if (translate === -totalTranslate && diffY < -viewHeightd3) {
                    diffY = -viewHeightd3;
                    return;
                }
                console.log(diffY);
                if (diffY !== 0) {
                    var translateY = translate + diffY,
                        ratio = Math.abs(diffY) / viewHeight,
                        scale = ratio < 0.12 ? (1 - ratio) : 0.88,
                        scaleY = (1 - scale) * viewHeight / 2,
                        sTranslateY = diffY < 0 ? (scaleY - diffY) : (-diffY - scaleY),
                        translateY = diffY < 0 ? parseInt(translate + diffY - scaleY * 2) : parseInt(translate + diffY + scaleY * 2);
                    //images_container移动
                    imagesContainer.style.cssText = '-webkit-transform:translateY(' + translateY + 'px);transform:translateY(' + translateY + 'px);';
                    //当前的image_container移动并缩小
                    images[currIndex].style.cssText += 'z-index:0;-webkit-transform:translateY(' + sTranslateY + 'px) scale(' + scale + ');transform:translateY(' + sTranslateY + 'px) scale(' + scale + ');';
                }
            } else {
                var diffZ = Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2));
                var angel = Math.acos(Math.abs(diffY) / diffZ) / Math.PI * 180;
                if (diffZ > 5 && angel < ANGEL) {
                    e.preventDefault();
                    isMoved = true;
                }
            }
        }, false);
        container.addEventListener('touchend', function () {
            if (isTouching && isMoved) {
                var preIndex = currIndex;
                imagesContainer.classList.add('images_container');
                images[preIndex].classList.add('image_container_transition');
                if (translate === 0 && diffY > 0 || translate === -totalTranslate && diffY < 0) {
                    translate = translate;
                } else if (Math.abs(diffY) > DIS) {
                    translate = diffY > 0 ? (translate + viewHeight) : (translate - viewHeight);
                    currIndex = diffY > 0 ? (currIndex - 1) : (currIndex + 1);
                }
                //images_container移动
                imagesContainer.style.cssText = '-webkit-transform:translateY(' + translate + 'px);transform:translateY(' + translate + 'px);';
                //当前的image_container移动并缩小
                images[preIndex].style.cssText += 'z-index:1;-webkit-transform:translateY(' + 0 + 'px) scale(1);transform:translateY(-' + 0 + 'px) scale(1);';
            }
            isTouching = false;
            isMoved = false;
        }, false);
    }

    return {
        init: init
    }
})(window, document);