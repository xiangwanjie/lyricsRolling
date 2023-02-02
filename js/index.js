/**
 * @description: 解析歌词字符串，得到一个歌词对象的数组，每个歌词对象：{time: 开始时间, words: 歌词内容}
 * @return {Object}
 */
function parseLrc(lrc) {
  let list = [];
  lrc = lrc.split('\n');
  let new_lrc = lrc.slice(lrc.indexOf('[offset:0]') + 1);
  new_lrc.forEach(itemStr => {
    let parts = itemStr.split(']');
    let timeStr = parts[0].replace(/\[/g, '');
    if (parts[1]) { 
      list.push( {
        time: parseTime(timeStr),
        words: parts[1]
      })
    }
  });
  return list;
}

/**
 * @description: 将一个时间字符串解析为数字（秒）
 * @param {String} timeStr 时间字符串
 * @return {Number}
 */
function parseTime(timeStr) {
  let parts = timeStr.split(':');
  return +parts[0] * 60 + +parts[1]
}

const lrcData = parseLrc(lrc_zhang);

// 获取需要的 dom
const doms = {
  audio: document.querySelector('#music'),
  ul: document.querySelector('#lrc-list'),
  container: document.querySelector('#container'),
}

/**
 * @description: 计算出，在当前播放器播放到第几秒的情况下，lrcData数组中，应该高亮显示的歌词下标, 如果没有找到返回-1
 * @return {*}
 */
function findIndex() {
  const { currentTime } = doms.audio
  let index = lrcData.findIndex(item => item.time > currentTime);
  return index < 0 ? lrcData.length - 1 : index - 1;
}

function createLrcElements() {
  /* 
    优化：
      创建一个 createDocumentFragment 文档片段
      将创建的 li 添加到文档片段中，再一次性添加到 ul 中
  */
  let frag = document.createDocumentFragment(); // 文档片段
  lrcData.forEach(item => {
    if (item.words) {
      let li = document.createElement('li');
      if (!item.words) li.style.height = 0;
      li.textContent = item.words;
      frag.appendChild(li)
    }
  });
  doms.ul.appendChild(frag);
}

createLrcElements()

// 容器高度
const containerHeight = doms.container.clientHeight;
// li 高度
const liHeight = doms.ul.children[0].clientHeight;
// 最大偏移量
const maxOffset = doms.ul.clientHeight - containerHeight;

/**
 * @description: 设置 ul 元素的偏移量
 * @return {*}
 */
function setOffset() {
  let index = findIndex();
  let offset = (index * liHeight) + (liHeight / 2) - (containerHeight / 2);
  if (offset > maxOffset) {
    offset = maxOffset;
  }
  if (offset < 0) offset = 0;
  // 添加歌词底部阴影遮罩样式
  offset > 0 ? doms.container.classList.add('up-mask') : doms.container.classList.remove('up-mask')
  offset < maxOffset ? doms.container.classList.add('dow-mask') : doms.container.classList.remove('dow-mask')
  
  // 修改 ul 偏移量s
  doms.ul.style.transform = `translateY(-${offset}px)`;

  // 去掉之前的 active 样式
  let li = doms.ul.querySelector('.active');
  if (li) li.classList.remove('active')

  // 高亮歌词
  li = doms.ul.children[index];
  if (li) li.classList.add('active');
}

// 监听 audio 播放进度
doms.audio.addEventListener('timeupdate', setOffset)
