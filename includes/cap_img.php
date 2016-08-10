<?php
/**
 * Created by PhpStorm.
 * User: Aaron Allen
 * Date: 8/9/2016
 * Time: 9:30 PM
 */

/**
 * Create a captcha image from code
 *
 * @param $code
 * @return string
 */
function makeImage($code) {
    // get path of font file
    $fontPath = realpath('.') . '/chaparral.ttf';

    $tsize = imagettfbbox(30, 0, $fontPath, $code);

    $width = abs($tsize[2] - $tsize[0]) + 10;
    $height = abs($tsize[5] - $tsize[3]) + 10;
    $height = 40;

    $img = imagecreate($width, $height);

    $black = imagecolorallocate($img, 0x00, 0x00, 0x00);
    $white = imagecolorallocate($img, 0xFF, 0xFF, 0xFF);

    //imagestring($img, 5, 0, 0, $code, $black);
    imagettftext($img, 30, 0, 5, $height - 10, $white, $fontPath, $code);

    $path = './images/cap/' . uniqid('cap', false) . '.gif';
    imagegif($img, $path);

    imagedestroy($img);

    $url = BASE_URL . substr($path, 2);

    return [$url, $path];
}