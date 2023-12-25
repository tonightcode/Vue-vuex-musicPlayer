import {getLyric} from 'api/song'
import {ERR_OK} from 'api/config'
import {Base64} from 'js-base64'
import jsonp from 'common/js/jsonp'

export default class Song {
  constructor({id, mid, singer, name, album, duration, image, url}) {
    this.id = id
    this.mid = mid
    this.singer = singer
    this.name = name
    this.album = album
    this.duration = duration
    this.image = image
    this.url = url
  }

  getLyric() {
    if (this.lyric) {
      return Promise.resolve(this.lyric)
    }

    return new Promise((resolve, reject) => {
      getLyric(this.mid).then((res) => {
        if (res.retcode === ERR_OK) {
          this.lyric = Base64.decode(res.lyric)
          resolve(this.lyric)
        } else {
          reject('no lyric')
        }
      })
    })
  }
}

export function createSong(musicData) {
  return new Song({
    id: musicData.songid,
    mid: musicData.songmid,
    singer: filterSinger(musicData.singer), // filterSinger 中处理一遍
    name: musicData.songname,
    album: musicData.albumname,
    duration: musicData.interval,
    image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`,
    url: `http://dl.stream.qqmusic.qq.com/C400000qXnlU3cLQwg.m4a?fromtag=120032&guid=1836717936&vkey=65EE8BBBCFB8131FCF13B7F51D4C9EF8AEB5EDEC399628FDA1297F2F6018806F8E31FCE35899CC2ADF1101D37B601E2628F127AF35E717DC`
  })
}

// 获取歌曲的vkey
export function getSongInfo(songmid) {
  const url = 'https://u.y.qq.com/cgi-bin/musics.fcg'
  const data = Object.assign({
    g_tk: 1124214810,
    loginUin: global.uin || '0',
    hostUin: 0,
    inCharset: 'utf8',
    outCharset: 'utf-8',
    // format: 'json',
    notice: 0,
    platform: 'yqq.json',
    needNewCode: 0
  }, {
    callback: 'musicJsonCallback',
    loginUin: 3051522991,
    format: 'jsonp',
    platform: 'yqq',
    needNewCode: 0,
    cid: 205361747,
    uin: 3051522991,
    guid: 5931742855,
    songmid: songmid,
    filename: `C400${songmid}.m4a`
  })
  return jsonp(url, data)
}

function filterSinger(singer) {
  let ret = []
  if (!singer) {
    return ''
  }
  singer.forEach((s) => {
    ret.push(s.name)
  })
  return ret.join('/')
}

