<!--=================================
Modal del Video
==================================-->

<div class="modal fade" id="myVideo">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content">

      <!-- Modal body -->
      <div class="modal-body">

        <button type="button" class="btn btn-default rounded rounded-circle border-0 float-end" data-bs-dismiss="modal"><i class="bi bi-x-lg"></i></button>

        <video class="rounded" controls="" style="width:100%">
          <source src="<?php echo urldecode($raffle->video_product) ?>">
        </video> 

      </div>

    </div>
  </div>
</div>
