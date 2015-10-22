<?php
/**
 * Created by PhpStorm.
 * User: liuyuzhong
 * Date: 2015/8/19
 * Time: 23:17
 */


class Controller_File extends Controller_Base {

    protected $_users;
    protected $_analysis;
    protected $_dataModel;

    public function __construct() {
        $this->_dataModel = new Model_Data();
    }


    /**
     * 上传文件相关处理方法
     * todo::这里要加上ftp文件转移处理
     */
    public function actionUploadify() {
        $tmpFile = $_FILES['upload_file']['tmp_name'];
        //$pathinfo = pathinfo($_FILES['upload_file']['name']);
        $fileName = $_FILES['upload_file']['name'];
        $data = $this->csv_get_lines($tmpFile);
      

        $result = array();
        if($data){
            $rowData['data_name'] = $fileName;
            $rowData['data_info'] = json_encode($data);
            $rowData['user_id']   = $_POST['userId'];
            // var_dump($data);
            $id =  $this->_dataModel->addData($rowData);
            $result=array(
                'status'=>0,
                'data'=>'上传成功',
            );
        }else{
            $result=array(
                'status'=>1,
                'data'=>'上传失败',
            );
        }

        echo json_encode($result);
        exit;

    }

    public function actionGetCsvTitle(){
        $filename = $_POST['fname'];
        $file = fopen('./static/files/'.$filename,'r');
        $title = fgetcsv($file);
        echo json_encode($title);
    }

    /**
     * csv_get_lines 读取CSV文件中的某几行数据
     * @param $csvfile csv文件路径
     * @return array
     * */
    public function csv_get_lines($csvfile) {
        if(!$fp = fopen($csvfile, 'r')) {
            return false;
        }

        $data = array();
        while(!feof($fp)) {
            if($str = fgetcsv($fp)){
                $data[] = $str;
            }

        }
        fclose($fp);
        return $data;
    }

    public function actionDownload(){
        $dataId = $_GET['dataId'];
        $userId = $_GET['userId'];
        $data = $this->_dataModel->getDataById($dataId,$userId);
        if($data){
            $fileName = $data['data_name'];
            // $fileName .='.csv';
            $dataInfo = json_decode($data['data_info'],true);

            header("Content-Type: application/vnd.ms-excel; charset=GB2312");
            header("Pragma: public");
            header("Expires: 0");
            header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
            header("Content-Type: application/force-download");
            header("Content-Type: application/octet-stream");
            header("Content-Type: application/download");
            header("Content-Disposition: attachment;filename={$fileName}");
            header("Content-Transfer-Encoding: binary ");
            $line = '';
            $dataInfo = json_decode($data['data_info'],true);
            $line = '';
            foreach ($dataInfo as $lineArr) {
                foreach($lineArr as $v){
                    $line .= $v . ",";
                }
                $line = mb_substr($line,0,-1, 'utf-8');
                $line .="\n";
            }
            echo @iconv("utf-8", "gb2312", $line);
        }


    }

}
