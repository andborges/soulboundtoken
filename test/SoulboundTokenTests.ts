import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat'

describe('SoulboundToken', function () {
  async function deploySoulboundTokenFixture() {
    const [owner, otherAccount] = await ethers.getSigners()

    const SoulboundToken = await ethers.getContractFactory('SoulboundToken')
    const soulboundToken = await SoulboundToken.deploy()

    return { soulboundToken, owner, otherAccount }
  }

  describe('Deployment', function () {
    it('Should set the right owner', async function () {
      const { soulboundToken, owner } = await loadFixture(deploySoulboundTokenFixture)

      expect(await soulboundToken.owner()).to.equal(owner.address)
    })

    it('Should implement right interface', async function () {
      const { soulboundToken, owner } = await loadFixture(deploySoulboundTokenFixture)

      expect(await soulboundToken.supportsInterface('0x80ac58cd')).to.true
      expect(await soulboundToken.supportsInterface('0x5b5e139f')).to.true
      expect(await soulboundToken.supportsInterface('0x780e9d63')).to.true
    })
  })

  describe('Mint', function () {
    it('Should mint the tokens to the owner', async function () {
      const { soulboundToken, owner } = await loadFixture(deploySoulboundTokenFixture)

      await expect(soulboundToken.safeMint(owner.address))
        .to.emit(soulboundToken, 'Transfer')
        .withArgs('0x0000000000000000000000000000000000000000', owner.address, 0)

      expect(await soulboundToken.balanceOf(owner.address)).to.equal(1)
    })

    it('Should mint the tokens to other user', async function () {
      const { soulboundToken, otherAccount } = await loadFixture(deploySoulboundTokenFixture)

      await expect(soulboundToken.safeMint(otherAccount.address))
        .to.emit(soulboundToken, 'Transfer')
        .withArgs('0x0000000000000000000000000000000000000000', otherAccount.address, 0)

      expect(await soulboundToken.balanceOf(otherAccount.address)).to.equal(1)
    })
  })

  describe('Transfer', function () {
    it('Should revert if try to transfer', async function () {
      const { soulboundToken, owner, otherAccount } = await loadFixture(deploySoulboundTokenFixture)
      await soulboundToken.safeMint(owner.address)

      await expect(soulboundToken.transferFrom(owner.address, otherAccount.address, 0)).to.be.revertedWith(
        'SoulboundToken: this is a Soulbound token and cannot be transferred. It can only be burned by the token owner',
      )
    })
  })

  describe('Burn', function () {
    it('Should burn the tokens by token owner', async function () {
      const { soulboundToken, otherAccount } = await loadFixture(deploySoulboundTokenFixture)
      await soulboundToken.safeMint(otherAccount.address)

      await expect(soulboundToken.connect(otherAccount).burn(0))
        .to.emit(soulboundToken, 'Transfer')
        .withArgs(otherAccount.address, '0x0000000000000000000000000000000000000000', 0)
    })

    it('Should revert if not token owner try to burn token', async function () {
      const { soulboundToken, otherAccount } = await loadFixture(deploySoulboundTokenFixture)
      await soulboundToken.safeMint(otherAccount.address)

      await expect(soulboundToken.burn(0)).to.be.revertedWith(
        'ERC721: caller is not token owner or approved',
      )
    })
  })
})
