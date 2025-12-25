<style>

body {
  font-family: "Josefin Sans", serif;
  font-optical-sizing: auto;
  font-weight: 400;
  font-style: normal;
  overflow-x: hidden;
  background: <?php echo urldecode($template->color1_template) ?> !important;
  color: <?php echo urldecode($template->color0_template) ?> !important;
}

body.coming-soon:before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background-color: <?php echo urldecode($template->color3_template) ?> !important;
  opacity: 0.7;
  z-index: 1;
}

.josefin-sans-700 {
  font-family: "Josefin Sans", serif;
  font-optical-sizing: auto;
  font-weight: 700;
  font-style: normal;
}

ul, ol{
  padding: 0;
  list-style: none;
  text-decoration: none;
}

a:link, a:visited,  a:hover, a:active{
    text-decoration: none !important;
    color: inherit !important;
}

p,h1,h2,h3,h4,h5,h6{
  color:<?php echo urldecode($template->color0_template) ?> !important;
}

.rounded{
  border-radius:12px !important;
}

#top, .modal-content.bg{
  background: <?php echo urldecode($template->color2_template) ?> !important;
  color: <?php echo urldecode($template->color0_template) ?> !important;
}

#hero{
  overflow: hidden;
  color:<?php echo urldecode($template->color0_template) ?> !important;
  background: <?php echo urldecode($template->color5_template) ?> !important;
  background: linear-gradient(0deg, <?php echo urldecode($template->color5_template) ?> 0%, <?php echo urldecode($template->color2_template) ?> 100%) !important;
  height:70vh;
  
}

#heroCheckout{
  overflow: hidden;
  color:<?php echo urldecode($template->color0_template) ?> !important;
  background: <?php echo urldecode($template->color5_template) ?> !important;
  background: linear-gradient(0deg, <?php echo urldecode($template->color5_template) ?> 0%, <?php echo urldecode($template->color2_template) ?> 100%) !important;  
}

@media all and (max-width: 991px) {
  #hero {
    height:105vh;
  }
}

.t1{
  color: <?php echo urldecode($template->color8_template) ?> !important;
}

#hero .b1, #heroCheckout .b1, #main .b1, .btn.b1{
  color:<?php echo urldecode($template->color0_template) ?> !important;
  background: <?php echo urldecode($template->color6_template) ?> !important;
  background: linear-gradient(0deg, <?php echo urldecode($template->color8_template) ?> 0%, <?php echo urldecode($template->color6_template) ?> 100%) !important;
}

#hero .b2{
  color:<?php echo urldecode($template->color0_template) ?> !important;
  background: <?php echo urldecode($template->color4_template) ?> !important;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.ray {
  animation: rotate 20s linear infinite;
}

#main{
  background:<?php echo urldecode($template->color1_template) ?> !important;
  color:<?php echo urldecode($template->color0_template) ?> !important;
}

@media all and (min-width: 992px) {
  #main .countdown{
    position: relative;
    bottom:100px;
  }
}

#main .c1{
  width:80px;
  line-height:80px;
}

#main p{
   color:<?php echo urldecode($template->color0_template) ?> !important;
}

#main .bg{
  background:<?php echo urldecode($template->color3_template) ?> !important;
}

#main .numbers, #heroCheckout .numbers{
  width:70px !important;
  height:70px !important;
  line-height:70px !important;
  border:1px solid <?php echo urldecode($template->color0_template) ?>;
}

#heroCheckout .numbers{
  background:orange;
  color: <?php echo urldecode($template->color0_template) ?>;
}

#main .numbers.sold{
  background:<?php echo urldecode($template->color4_template) ?> !important;
  color:<?php echo urldecode($template->color8_template) ?>;
}

#main .numbers.sold:before{
  position:absolute;
  margin-left:5px;
  font-family: "bootstrap-icons";  
  font-weight: 900;
  content: "\F657";
}

#prize{
  background: <?php echo urldecode($template->color1_template) ?>  !important;
  background: linear-gradient(0deg, <?php echo urldecode($template->color1_template) ?> 0%, <?php echo urldecode($template->color2_template) ?>  100%) !important;
}

#prize a{
  color: <?php echo urldecode($template->color0_template) ?> !important;
}

#prize .bg{
  background:<?php echo urldecode($template->color3_template) ?> !important; 
}

#prize .progress-bar{
  background: <?php echo urldecode($template->color7_template) ?> !important;
}

#faq .bgFaq{
  background: <?php echo urldecode($template->color3_template) ?> !important;
  color: <?php echo urldecode($template->color0_template) ?> !important;
}

#myVideo .modal-dialog .modal-content{
  background: <?php echo urldecode($template->color2_template) ?> !important;
  color: <?php echo urldecode($template->color0_template) ?> !important;

}

#myVideo .btn{
   color: <?php echo urldecode($template->color0_template) ?> !important;
}

.colorImage{
  filter: hue-rotate(<?php echo json_decode(urldecode($template->filters_template))->hue ?>deg) saturate(<?php echo json_decode(urldecode($template->filters_template))->saturate ?>%) invert(<?php echo json_decode(urldecode($template->filters_template))->invert ?>%);
}

@media (min-width: 1366px) {
    .display-2 {
        font-size: 4.5rem !important;
    }
}

@media (min-width: 992px) and (max-width: 1365px){
    .display-2 {
        font-size: 3rem !important;
    }
}

</style>

