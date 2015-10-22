<?php

class Controller_Base {

    protected $_response;
    protected $_request;
    protected $_profiler;
    protected $_app;
    protected $_validation;
    protected $_path_info;
    protected $_session;
    public $smarty;
    protected $publishid = '';

    public function before() {
    
        $this->_response = Noah::instance('Response');
        $this->_request = Noah::instance('Request');
        $this->_profiler = Noah::instance('Profiler');
        $this->_app = Noah::instance('App');
        $this->_validation = Noah::instance('Validation');

        if ($this->_app->controller != 'login' ) {
            if (!isset($_SESSION['userInfo'])) {
               $this->_response->redirect('http://'.$_SERVER['HTTP_HOST'].'/login');
            }
        }


        require_once (Noah::getVendorPath() . 'smarty/Smarty.class.php');
        $this->smarty = new Smarty();

        foreach ($this->_app->config('smarty') as $key => $val) {
            $key = 'set' . ucfirst($key);
            $this->smarty->{$key}($val);
        }
        $this->smarty->assign("currentC", $this->_app->controller);
        $this->smarty->assign("action", $this->_app->action);
        if (isset($_SESSION['userinfo'])) {
            $this->smarty->assign("adminUser", $_SESSION['userinfo']);
        }
    }

    /**
     * 将分钟数转化为短字符串
     *
     * @param integer $minute
     * @return string
     */
    protected function _makeMinutesToShortString($s) {
        if (empty($s)) {
            return "";
        }
        $timestringArray = $this->_app->config['timestringArray'];
        //按值逆向排序
        arsort($timestringArray);

        $shortstring = array();
        foreach ($timestringArray as $key => $value) {
            if (0 != floor($s / $value)) {
                $shortstring[] = floor($s / $value) . $key;
            }
            $s %= $value;
        }

        return implode(":", $shortstring);
    }

    /**
     * 将短字符串转化为秒数
     *
     * @param string $shortstring
     * @return integer $minutes
     */
    protected function _makeShortStringToMinutes($shortstring) {
        $timestringArray = $this->_app->config['timestringArray'];
        //秒数
        $s = 0;
        preg_match_all("/(\d+)([a-zA-Z]+)/", $shortstring, $matches);

        if (!empty($matches)) {
            foreach ($matches[1] as $key => $value) {
                $s += $value * $timestringArray[$matches[2][$key]];
            }
        }

        return $s;
    }

    /**
     * 
     * 获取两个时间段的日期结果集
     * @param unknown_type $start
     * @param unknown_type $end
     */
    protected function _getdays($start, $end) {
        list($s_year, $s_month, $s_day) = explode("-", $start);
        list($e_year, $e_month, $e_day) = explode("-", $end);
        $mk_start = mktime(0, 0, 0, $s_month, $s_day, $s_year);
        $mk_end = mktime(0, 0, 0, $e_month, $e_day, $e_year);
        $day = ($mk_end - $mk_start) / (24 * 3600);
        $re_arr = array();
        for ($i = 0; $i < $day + 1; $i++) {
            $temp_day = $s_day + $i;
            $str = mktime(0, 0, 0, $s_month, $temp_day, $s_year);
            $re_arr[$i] = strftime("%Y-%m-%d", $str);
        }
        return $re_arr;
    }

    /**
     *
     * 上传图片
     */
    public function actionUploadImg() {
        /**
         * 大图地址
         */
        $path = $this->_request->get('path', false);
        /**
         * 缩略图地址
         */
        $thumbPath = $this->_request->get('thumbPath', false);
        /**
         * 宽度
         */
        $width = $this->_request->get('width', false);
        /**
         * 高度
         */
        $height = $this->_request->get('height', false);
        /**
         * 返回图片类型  large, thumb
         */
        $r = $this->_request->get('r', 'large');
        $mp3_name = $_FILES['Filedata']['name'];
        if (!empty($mp3_name)) {
            $logo_tmpname = $_FILES['Filedata']['tmp_name'];
            $logo_type = substr(strrchr($mp3_name, '.'), 1);
            $logo_size = $_FILES['Filedata']['size'];
            if (!$path) {
                $uploadUrl = UPLOADPATH . "/vote/";
                $newName = md5(microtime() . 'ifeng' . rand(0, 10000)) . '.' . $logo_type;
                if (move_uploaded_file($logo_tmpname, $uploadUrl . $newName)) {

                    $data['voteimg'] = "/vote/" . $newName;


                    require('../../ifeng/ifeng.php');
                    require('../config/image.php');
                    require('../../ifeng/lib/class.IFengFtp.php');
                    $ftp = new IFengFtp('web', $ifengConfig);
                    /**
                     * ftp上传图片服务器
                     */
                    $ftp->put($data['voteimg'], $uploadUrl . $newName);

                    $data['voteimgurl'] = IMAGEURL . $data['voteimg'];
                }
            } else {
                $uploadUrl = UPLOADPATH . '/' . $path . '/';
                $imagename = md5(microtime() . 'ifeng' . rand(0, 10000));
                $newName = $imagename . '.' . $logo_type;
                if (move_uploaded_file($logo_tmpname, $uploadUrl . $newName)) {
                    include_once '../../ifeng/ifeng.php';
                    require('../config/image.php');
                    require('../../ifeng/lib/class.IFengFtp.php');
                    $ftp = new IFengFtp('web', $ifengConfig);
                    /**
                     * ftp上传图片服务器
                     */
                    $ftp->put('/' . $path . '/' . $newName, $uploadUrl . $newName);
                    if ($thumbPath && $width && $height) {
                        /**
                         * 生成缩略图
                         */
                        $newThumbPath = UPLOADPATH . '/' . $thumbPath . '/';
                        if ($this->createThumbImage($uploadUrl . $newName, $newThumbPath . $newName, $width, $height)) {
                            /**
                             * ftp上传图片服务器
                             */
                            $ftp->put('/' . $thumbPath . '/' . $newName, $newThumbPath . $newName);
                        }
                    }
                    $data['imagename'] = $imagename;
                    $data['voteimg'] = "/images/" . $path . '/' . $newName;
                    if ($r == 'large') {
                        $data['voteimgurl'] = IMAGEURL . $data['voteimg'];
                    } else {
                        $data['voteimgurl'] = IMAGEURL . '/images/' . $thumbPath . '/' . $newName;
                    }
                }
            }
        }
        $result = array(
            'code' => 1,
            'data' => empty($data) ? array() : $data
        );

        echo json_encode($result);
        exit();
    }

    public function emailCheck($email_address)
    {
        $pattern = "/^([0-9A-Za-z\\-_\\.]+)@([0-9a-z]+\\.[a-z]{2,3}(\\.[a-z]{2})?)$/i";
        if ( preg_match( $pattern, $email_address ) )
        {
           return true;
        }
        else
        {
            return false;
        }
    }

    /**
     * 格式化REQUEST字符串数据
     *
     * @param String $feild
     * @return String(Array)
     */
    public function toStr($feild, $dropHtml = true) {
        if (isset($_REQUEST[$feild])) {
            $val = $_REQUEST[$feild];
            if (is_array($val))
                return $val;
            $val = strval($val);
            if ($dropHtml == true)
            // return trim(htmlspecialchars($val));
                return trim(strip_tags($val));
            return $val;
        }
        return '';
    }

    /**
     * 格式化REQUEST数值数据
     *
     * @param String $feild
     * @return Int
     */
    public function toInt($feild) {
        return isset($_REQUEST[$feild]) ? intval($_REQUEST[$feild]) : 0;
    }

    /**
     * 错误信息
     */
    public function error($message, $step = -1) {
        echo "<script type='text/javascript'>alert('$message');window.history.go($step);</script>";
        exit;
    }

    //通过图片剪裁控件进行图片剪裁 返回的是图片的路径例如：/images/ad/33b68868decd3b044d68f3b142c9f0fc.jpg
    //TODO::liuyuzhong 此功能是为图片剪裁模块使用，暂时未用到
    public function actionCreateNewPic() {
        $param = isset($_POST['param']) ? $_POST['param'] : false;
        $type = isset($_POST['type']) ? $_POST['type'] : "cut";
        $picUrl = isset($_POST['picUrl']) ? $_POST['picUrl'] : false;
        $path = isset($_POST['path']) ? $_POST['path'] : false;
        if (!$param || !$type || !$picUrl) {
            echo "<script type='text/javascript'>alert('参数错误');window.history.go(-1);</script>";
            exit;
        }
        //文件以月份进行分类例如 /vote/2013-07/
        $data = date("Y-m");
        if (!$path) {
            $uploadUrl = UPLOADPATH . "/vote/" . $data . "/";
        } else {
            $uploadUrl = UPLOADPATH . '/' . $path . "/" . $data . "/";
        }
        //如果不存在文件夹则新建
        if (!file_exists($uploadUrl)) {
            mkdir($uploadUrl, 0777);
        }

        $paramArr = explode("+", $param);

        $width = $paramArr[0];
        $height = $paramArr[1];
        $startX = $paramArr[2];
        $startY = $paramArr[3];
        $rx = $paramArr[4];
        $pathinfo = pathinfo($picUrl);

        $newPicname = $pathinfo['filename'] . "_" . $type . "." . $pathinfo['extension']; //新生成的图片名字 
        $newPic = $uploadUrl . $newPicname;

        $cropped = $this->resizeThumbnailImage($newPic, $picUrl, $width, $height, $startX, $startY, $rx);
        if ($cropped) {
            include_once '../../ifeng/ifeng.php';
            require('../config/image.php');
            require('../../ifeng/lib/class.IFengFtp.php');
            $ftp = new IFengFtp('web', $ifengConfig);
            /**
             * ftp上传图片服务器
             */
            $ftp->put('/' . $path . '/' . $data . "/" . $newPicname, $uploadUrl . $newPicname);
            echo '/images/' . $path . '/' . $data . "/" . $newPicname;
            exit;
        }
        echo "<script type='text/javascript'>alert('保存失败');window.history.go(-1);</script>";
        exit;
    }

    //
    public function resizeThumbnailImage($thumb_image_name, $image, $width, $height, $start_width, $start_height, $scale) {
        list($imagewidth, $imageheight, $imageType) = getimagesize($image);
        $imageType = image_type_to_mime_type($imageType);
        $newImageWidth = ceil($width * $scale);
        $newImageHeight = ceil($height * $scale);
        $newImage = imagecreatetruecolor($newImageWidth, $newImageHeight);
        switch ($imageType) {
            case "image/gif":
                $source = imagecreatefromgif($image);
                break;
            case "image/pjpeg":
            case "image/jpeg":
            case "image/jpg":
                $source = imagecreatefromjpeg($image);
                break;
            case "image/png":
            case "image/x-png":
                $source = imagecreatefrompng($image);
                break;
        }
        imagecopyresampled($newImage, $source, 0, 0, $start_width, $start_height, $newImageWidth, $newImageHeight, $width, $height);

        switch ($imageType) {
            case "image/gif":
                imagegif($newImage, $thumb_image_name);
                break;
            case "image/pjpeg":
            case "image/jpeg":
            case "image/jpg":
                imagejpeg($newImage, $thumb_image_name, 100);  //参数100是图片质量
                break;
            case "image/png":
            case "image/x-png":
                imagepng($newImage, $thumb_image_name);
                break;
        }

        chmod($thumb_image_name, 0777);
        return $thumb_image_name;
    }

    //这个函数是修改图片大小，目前用于新增有声书logo的批量处理
    function resizeImage($image, $newImageWidth, $newImageHeight) {
        list($imagewidth, $imageheight, $imageType) = getimagesize($image);
        $imageType = image_type_to_mime_type($imageType);
        $uploadUrl = UPLOADPATH . "/programimg/";
        $pathinfo = pathinfo($image);
        $newPicname = md5(microtime() . 'ifeng' . rand(0, 10000)) . '.' . $pathinfo['extension']; //新生成的图片名字 
        $newpic = $uploadUrl . $newPicname; //新生成图片地址

        $newImage = imagecreatetruecolor($newImageWidth, $newImageHeight);
        switch ($imageType) {
            case "image/gif":
                $source = imagecreatefromgif($image);
                break;
            case "image/pjpeg":
            case "image/jpeg":
            case "image/jpg":
                $source = imagecreatefromjpeg($image);
                break;
            case "image/png":
            case "image/x-png":
                $source = imagecreatefrompng($image);
                break;
        }
        imagecopyresampled($newImage, $source, 0, 0, 0, 0, $newImageWidth, $newImageHeight, $imagewidth, $imageheight);

        switch ($imageType) {
            case "image/gif":
                imagegif($newImage, $newpic, 90);
                break;
            case "image/pjpeg":
            case "image/jpeg":
            case "image/jpg":
                imagejpeg($newImage, $newpic, 90);
                break;
            case "image/png":
            case "image/x-png":
                imagepng($newImage, $newpic, 90);
                break;
        }
        $pic['picname'] = $newPicname;
        $pic['picnurl'] = $newpic;
        return $pic;
    }

    /*
     * 格式化返回的时间，个位数补齐0
     * */

    public function _formatTime($time) {
        if ($time < 10) {
            return "0" . $time;
        } else
            return $time;
    }

    /**
     * 转化时长秒为时间格式
     */
    public function _formatDuration($duration) {
        $time = '';
        $needm = false;
        if ($h = floor($duration / 3600)) {
            $time .= $this->_formatTime($h) . ":";
        }
        if ($m = floor(($duration % 3600) / 60)) {
            $time .= $this->_formatTime($m) . ":";
        } else {
            $time .= "00:";
        }
        $time .= $this->_formatTime(floor($duration % 60));
        return $time;
    }

    /**
     * 获取访问者的手机平台
     */
    public function _get_os() {
        $os = $_SERVER ['HTTP_USER_AGENT'];
        if (strpos($os, "Android"))
            $os = "android";
        elseif (strpos($os, "iPhone") || strpos($os, "iPad") || strpos($os, "iPod"))
            $os = "ios";
        elseif (strpos($os, "Windows"))
            $os = "Windows Phone";
        else
            $os = "Other";
        return $os;
    }

}
