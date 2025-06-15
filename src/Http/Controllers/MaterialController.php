<?php

namespace App\Admin\Controllers;

use App\Models\Company\MaterialImage;
use App\Models\Company\MaterialVideo;
use App\Models\Company\MaterialFile;
use Illuminate\Http\Request;

class MaterialController extends Controller
{
    /**
     * 通过ID获取素材信息
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getById(Request $request)
    {
        $id = $request->input('id');
        $type = $request->input('type'); // 添加类型参数
        
        if (!$id) {
            return response()->json(['code' => 400, 'msg' => '参数错误']);
        }

        // 如果指定了类型，则只在对应表中查找
        if ($type) {
            switch ($type) {
                case 'image':
                    return $this->getMaterialImage($id);
                case 'video':
                    return $this->getMaterialVideo($id);
                case 'file':
                    return $this->getMaterialFile($id);
                default:
                    return response()->json(['code' => 400, 'msg' => '不支持的素材类型']);
            }
        }

        // 如果没有指定类型，则按优先级查找
        // 先尝试查找视频素材（因为视频通常是主要需求）
        $response = $this->getMaterialVideo($id);
        if ($response->getData()->code == 200) {
            return $response;
        }
        
        // 再尝试查找图片素材
        $response = $this->getMaterialImage($id);
        if ($response->getData()->code == 200) {
            return $response;
        }
        
        // 最后尝试查找文件素材
        $response = $this->getMaterialFile($id);
        if ($response->getData()->code == 200) {
            return $response;
        }

        return response()->json(['code' => 404, 'msg' => '素材不存在']);
    }
    
    /**
     * 获取图片素材
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    private function getMaterialImage($id)
    {
        $material = MaterialImage::find($id);
        if ($material) {
            return response()->json([
                'code' => 200, 
                'msg' => '获取成功', 
                'data' => [
                    'id' => $material->id,
                    'content' => $material->content,
                    'cname' => $material->cname,
                    'type' => 'image'
                ]
            ]);
        }
        
        return response()->json(['code' => 404, 'msg' => '图片素材不存在']);
    }
    
    /**
     * 获取视频素材
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    private function getMaterialVideo($id)
    {
        $material = MaterialVideo::find($id);
        if ($material) {
            return response()->json([
                'code' => 200, 
                'msg' => '获取成功', 
                'data' => [
                    'id' => $material->id,
                    'content' => $material->content,
                    'cname' => $material->cname,
                    'type' => 'video',
                    'cover' => $material->cover,
                    'content_format' => $material->content_format,
                    'duration' => $material->duration,
                    'file_size' => $material->file_size
                ]
            ]);
        }
        
        return response()->json(['code' => 404, 'msg' => '视频素材不存在']);
    }
    
    /**
     * 获取文件素材
     * 
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    private function getMaterialFile($id)
    {
        $material = MaterialFile::find($id);
        if ($material) {
            return response()->json([
                'code' => 200, 
                'msg' => '获取成功', 
                'data' => [
                    'id' => $material->id,
                    'content' => $material->content,
                    'cname' => $material->cname,
                    'type' => 'file'
                ]
            ]);
        }
        
        return response()->json(['code' => 404, 'msg' => '文件素材不存在']);
    }
} 