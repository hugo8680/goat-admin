<template>
  <div class="container">
    <div class="logo">
      <img
          alt="logo"
          src="@/assets/logo.png"
          class="logo-img"
      />
    </div>
<!--    <LoginBanner/>-->
    <div class="content">
      <div class="content-inner">
        <LoginForm/>
      </div>
      <div class="footer">
        <Footer/>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Footer from '@/components/footer/index.vue';
import LoginForm from './components/login-form.vue';
</script>

<style lang="less" scoped>
.container {
  display: flex;
  height: 100vh;
  width: 100%;
  background-image: url('@/assets/images/login-background.svg');
  background-size: cover;

  .banner {
    width: 550px;
    background: linear-gradient(163.85deg, #1d2129 0%, #00308f 100%);
  }

  .content {
    position: relative;
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    padding-bottom: 40px;
  }
  .content-inner {
    box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
    background: #fff;
    padding: 12px 40px;
    border-radius: 10px;
  }

  .footer {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 100%;
  }
}

.logo {
  position: fixed;
  top: 24px;
  left: 22px;
  z-index: 1;
  display: inline-flex;
  align-items: center;

  &-img {
    width: 128px;
    height: auto;
  }

  &-text {
    margin-right: 4px;
    margin-left: 4px;
    color: var(--color-fill-1);
    font-size: 20px;
  }
}
</style>

<style lang="less" scoped>
// responsive
@media (max-width: @screen-lg) {
  .container {
    .banner {
      width: 25%;
    }
  }
}
</style>
