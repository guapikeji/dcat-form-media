<?php

namespace Lake\FormMedia\Form\Field;

use Lake\FormMedia\Form\Field;

/**
 * 表单文件字段
 *
 * @create 2020-11-30
 * @author deatil
 */
class Files extends Field
{
    protected $limit = 5;

    protected $remove = true;

    protected $type = 'blend';

    /**
     * 确保多值字段在存入数据库前正确解析为数组
     * @param mixed $value
     * @return mixed
     */
    public function prepare($value)
    {
        // 如果是JSON字符串，解码为PHP数组
        if (is_string($value) && $this->isJson($value)) {
            $value = json_decode($value, true);
        }

        // 如果有storeAsId设置，确保值为整数数组
        if ($this->storeAsId && is_array($value)) {
            $value = array_map(function ($id) {
                return (int)$id;
            }, $value);
        }

        return parent::prepare($value);
    }

    /**
     * 检查字符串是否为有效的JSON
     * @param string $string
     * @return bool
     */
    protected function isJson($string)
    {
        if (!is_string($string)) {
            return false;
        }

        json_decode($string);
        return (json_last_error() == JSON_ERROR_NONE);
    }
}
