<?php

namespace Lake\FormMedia\Http\Controllers;

use App\Models\Company\MaterialAudio;
use App\Models\Company\MaterialImage;
use App\Models\Company\MaterialVideo;
use Illuminate\Routing\Controller;
use Lake\FormMedia\MediaManager;
use LakeFormMedia;

class FormMedia extends Controller
{
    /**
     * 获取文件列表
     */
    public function getFiles()
    {
        $keywords = request()->input('keywords', '');
        $path = request()->input('path', '/');
        $currentPage = (int)request()->input('page', 1);
        $perPage = (int)request()->input('pageSize', 120);
        $disk = request()->input('disk', '');
        $type = (string)request()->input('type', 'image');
        $order = (string)request()->input('order', 'time');

        // $manager = MediaManager::create()
        //     ->defaultDisk()
        //     ->setPath($path);
        //
        // // 驱动磁盘
        // if (! empty($disk)) {
        //     $manager = $manager->withDisk($disk);
        // }
        // $files = $manager->ls($type, $order);
        // $list = collect($files)
        //     ->slice(($currentPage - 1) * $perPage, $perPage)
        //     ->values();
        //
        // $totalPage = count(collect($files)->chunk($perPage));

        $query = null;
        //         'image' => 'jpeg|jpg|bmp|png|svg|wbmp|pic|cgm|djv|djvu|gif|ico|ief|jp2|jpe|mac|pbm|pct|pgm|pict|pnm|pnt|pntg|ppm|qti|qtif|ras|rgb|tif|tiff|xbm|xpm|xwd|avif',
        //         'video' => 'mkv|avi|mp4|rmvb|rm|flv|wmv|asf|mpeg|mov',
        //         'audio' => 'mp3|wav|flac|3pg|aa|aac|ape|au|m4a|mpc|ogg',
        switch ($type) {
            case 'image':
                $query = MaterialImage::query();
                break;
            case 'video':
                $query = MaterialVideo::query();
                break;
            case 'audio':
                $query = MaterialAudio::query();
                break;
        }

        if (!empty($keywords)) {
            $query->where('cname', 'like', '%'.$keywords.'%');
            $query->orWhereHasIn('materialTags', function ($query) use ($keywords) {
                $query->where('cname', 'like', '%'.$keywords.'%');
            });
        }
        $query->orderByDesc('id');
        $totalPage = $query->count();

        $query->limit($perPage)->offset(($currentPage - 1) * $perPage);
        $list = $query->get();

        $imageMogr = '?imageMogr2/thumbnail/190x158';

        $list = $list->map(function ($item) use ($type, $imageMogr)   {
            $item->isDir = false;
            $item->name = $item->cname;
            $item->type = $type;
            $item->time = $item->created_at->format('Y-m-d H:i:s');
            $item->preview = "<span class=\"file-icon has-img\"><img src=\"{$item->content}{$imageMogr}\" alt=\"{$item->cname}\"></span>";
            $item->namesmall = $item->cname;
            return $item;
        });

        $data = [
            'list'         => $list,        // 数据
            'total_page'   => $totalPage,   // 数量
            'current_page' => $currentPage, // 当前页码
            'per_page'     => $perPage,     // 每页数量
            // 'nav' => $manager->navigation(),  // 导航
            'nav'          => []
        ];

        return $this->renderJson(LakeFormMedia::trans('form-media.get_success'), 200, $data);
    }

    /**
     * 上传
     */
    public function upload()
    {
        $files = request()->file('files');
        $path = request()->get('path', '/');

        $type = request()->get('type');
        $nametype = request()->get('nametype', 'uniqid');

        // 裁剪
        $resize = request()->get('resize', '');

        $manager = MediaManager::create()
            ->defaultDisk()
            ->setPath($path)
            ->setNametype($nametype);

        // 驱动磁盘
        $disk = request()->input('disk', '');
        if (!empty($disk)) {
            $manager = $manager->withDisk($disk);
        }

        if ($type != 'blend') {
            if (!$manager->checkType($files, $type)) {
                return $this->renderJson(LakeFormMedia::trans('form-media.upload_file_ext_error'), -1);
            }
        }

        // 图片裁剪操作
        $resizes = explode(",", $resize);
        if (
            $type == 'image'
            && !empty($resize)
            && count($resizes) == 2
        ) {
            try {
                foreach ($files as $file) {
                    $manager->prepareFile([
                        [
                            'method'    => 'resize',
                            'arguments' => $resizes,
                        ],
                    ], $file);
                }
            } catch (\Exception $e) {
            }
        }

        try {
            if ($manager->upload($files, $type)) {
                return $this->renderJson(LakeFormMedia::trans('form-media.upload_success'), 200);
            }
        } catch (\Exception $e) {
            return $this->renderJson($e->getMessage(), -1);
        }

        return $this->renderJson(LakeFormMedia::trans('form-media.upload_error'), -1);
    }

    /**
     * 新建文件夹
     */
    public function createFolder()
    {
        $dir = request()->input('dir');
        $name = request()->input('name');

        if (empty($dir)) {
            return $this->renderJson(LakeFormMedia::trans('form-media.create_dirname_empty'), -1);
        }

        $manager = MediaManager::create()
            ->defaultDisk()
            ->setPath($dir);

        // 驱动磁盘
        $disk = request()->input('disk', '');
        if (!empty($disk)) {
            $manager = $manager->withDisk($disk);
        }

        try {
            if ($manager->createFolder($name)) {
                return $this->renderJson(LakeFormMedia::trans('form-media.create_success'), 200);
            }
        } catch (\Exception $e) {
        }

        return $this->renderJson(LakeFormMedia::trans('form-media.create_error'), -1);
    }

    /**
     * 输出json
     */
    protected function renderJson($msg, $code = 200, $data = [])
    {
        return response()->json([
            'code' => $code,
            'msg'  => $msg,
            'data' => $data,
        ]);
    }
}



